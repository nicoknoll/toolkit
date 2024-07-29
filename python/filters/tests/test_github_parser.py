from ..parsers.github import GithubSyntaxParser
from ..types import *


# Operators


def test_sth():
    parser = GithubSyntaxParser("name:John,Jack age:<30 -age:28")
    assert parser.parse().query == And(
        Or(
            Eq("name", "John"),
            Eq("name", "Jack"),
        ),
        Lt("age", "30"),
        Not(Eq("age", "28")),
    )


def test_eq():
    parser = GithubSyntaxParser("name:John")
    assert parser.parse().query == Eq("name", "John")


def test_ge():
    parser = GithubSyntaxParser("age:>=30")
    assert parser.parse().query == Ge("age", "30")


def test_gt():
    parser = GithubSyntaxParser("age:>30")
    assert parser.parse().query == Gt("age", "30")


def test_le():
    parser = GithubSyntaxParser("age:<=30")
    assert parser.parse().query == Le("age", "30")


def test_lt():
    parser = GithubSyntaxParser("age:<30")
    assert parser.parse().query == Lt("age", "30")


def test_co():
    parser = GithubSyntaxParser("name:~John")
    assert parser.parse().query == Co("name", "John")


# def test_in():
#     parser = GithubSyntaxParser("name:@John")
#     assert parser.parse() == {"name": ["John", "Jack"]}


# Logical operators


def test_and():
    parser = GithubSyntaxParser("name:John age:30")
    assert parser.parse().query == And(
        Eq("name", "John"),
        Eq("age", "30"),
    )


def test_or():
    parser = GithubSyntaxParser("name:John,Jack")
    assert parser.parse().query == Or(
        Eq("name", "John"),
        Eq("name", "Jack"),
    )


def test_not():
    parser = GithubSyntaxParser("-name:John")
    assert parser.parse().query == Not(Eq("name", "John"))


def test_not_with_or():
    parser = GithubSyntaxParser("-name:John,Jack")
    assert parser.parse().query == Not(
        Or(
            Eq("name", "John"),
            Eq("name", "Jack"),
        )
    )


def test_not_with_and():
    parser = GithubSyntaxParser("-name:John age:30")
    assert parser.parse().query == And(
        Not(Eq("name", "John")),
        Eq("age", "30"),
    )


# Special values and complex queries


def test_multiple_fields():
    parser = GithubSyntaxParser("name:John age:30")
    assert parser.parse().query == And(
        Eq("name", "John"),
        Eq("age", "30"),
    )


def test_multiple_values():
    parser = GithubSyntaxParser("name:John,Jack")
    assert parser.parse().query == Or(
        Eq("name", "John"),
        Eq("name", "Jack"),
    )


def test_multiple_fields_and_values():
    parser = GithubSyntaxParser("name:John,Jack age:30,40")
    assert parser.parse().query == And(
        Or(
            Eq("name", "John"),
            Eq("name", "Jack"),
        ),
        Or(
            Eq("age", "30"),
            Eq("age", "40"),
        ),
    )


def test_values_with_spaces():
    parser = GithubSyntaxParser('name:"John Jack"')
    assert parser.parse().query == Eq("name", "John Jack")


# grouping


def test_grouping():
    parser = GithubSyntaxParser("(name:John,Jack age:30,40)")
    assert parser.parse().query == And(
        Or(
            Eq("name", "John"),
            Eq("name", "Jack"),
        ),
        Or(
            Eq("age", "30"),
            Eq("age", "40"),
        ),
    )


def test_grouping_with_and():
    parser = GithubSyntaxParser("(name:John,Jack AND age:30,40)")
    assert parser.parse().query == And(
        Or(
            Eq("name", "John"),
            Eq("name", "Jack"),
        ),
        Or(
            Eq("age", "30"),
            Eq("age", "40"),
        ),
    )


def test_github():
    parser = GithubSyntaxParser(
        '(language:ruby OR language:python AND name:nico) AND NOT path:"/tests/" AND age:>=30'
    )
    assert parser.parse().query == And(
        Or(
            Eq("language", "ruby"),
            And(
                Eq("language", "python"),
                Eq("name", "nico"),
            ),
        ),
        Not(Eq("path", "/tests/")),
        Ge("age", "30"),
    )
