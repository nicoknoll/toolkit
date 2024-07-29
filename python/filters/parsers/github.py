from itertools import chain

from pyparsing import (
    Word,
    alphas,
    alphanums,
    quotedString,
    Group,
    Forward,
    infixNotation,
    opAssoc,
    Suppress,
    oneOf,
    delimitedList,
    Combine,
    OneOrMore,
)

from .base import BaseParser
from ..types import Le, Lt, Ge, Gt, Eq, Or, And, Not, Co, FilterQuery

# Define the basic elements
identifier = Word(alphas, alphanums + "_")
negated_identifier = Combine("-" + identifier)
value = quotedString | Word(alphanums)

# Define the operators and their corresponding classes
operators = {":": Eq, ":<": Lt, ":<=": Le, ":>": Gt, ":>=": Ge, ":~": Co}

# Define the grammar for key-value pairs with operators
operator = oneOf(list(operators.keys()))
multiple_values = delimitedList(value, delim=",") | Group(value)

key_value = Group((negated_identifier | identifier) + operator + multiple_values)

# Define logical operators as constants
and_ = Suppress("AND")
or_ = Suppress("OR")
not_ = Suppress("NOT")

# Define the overall expression
expr = Forward()

# Define a term as either a key-value pair or a grouped expression
term = Group(Suppress("(") + expr + Suppress(")")) | key_value


def flatten(list_):
    """Flatten a nested list."""
    return (
        list(chain.from_iterable(map(flatten, list_)))
        if isinstance(list_, list)
        else [list_]
    )


def parse_not(tokens):
    """Parse NOT expressions."""
    return Not(tokens[0][0])


def parse_and(tokens):
    """Parse AND expressions."""
    return And(*flatten(tokens.asList()))


def parse_or(tokens):
    """Parse OR expressions."""
    return Or(*flatten(tokens.asList()))


def handle_sequence(tokens):
    """Handle sequences of terms separated by spaces as implicit AND."""
    tokens_list = flatten(tokens.asList())

    if len(tokens_list) == 1:
        return tokens_list

    return And(*tokens_list)


def parse_key_value(tokens):
    """Convert tokens to key-value class instances."""
    key, op, *op_values = tokens[0]
    operator_class = operators[op]
    key_name = key[1:] if key.startswith("-") else key

    value_instances = [
        operator_class(key_name, op_value.strip('"')) for op_value in op_values
    ]

    result = Or(*value_instances) if len(value_instances) > 1 else value_instances[0]

    if key.startswith("-"):
        result = Not(result)

    return result


# Attach parsing actions
key_value.setParseAction(parse_key_value)


# Define the expression using infix notation
expr <<= infixNotation(
    Group(OneOrMore(term)).setParseAction(handle_sequence),
    [
        (not_, 1, opAssoc.RIGHT, parse_not),
        (and_, 2, opAssoc.LEFT, parse_and),
        (or_, 2, opAssoc.LEFT, parse_or),
    ],
)


class GithubSyntaxParser(BaseParser):
    def parse(self) -> FilterQuery:
        """Parse the query string into a FilterQuery object."""

        parsed_result = expr.parseString(self.query, parseAll=True)[0]

        return FilterQuery(
            query=parsed_result,
            sort=None,
            limit=None,
            offset=None,
        )
