from datetime import date, datetime, time, timedelta
from decimal import Decimal


# strings (using URL encoding), numbers, booleans, null, undefined, and dates (in ISO UTC format without colon encoding)
ALLOWED_NUMERIC_TYPES = (int, float, Decimal)
ALLOWED_STRING_TYPES = (str,)
ALLOWED_DATE_TYPES = (date, datetime, time, timedelta)
ALLOWED_TYPES = (*ALLOWED_NUMERIC_TYPES, *ALLOWED_STRING_TYPES, *ALLOWED_DATE_TYPES)


class OperatorError(Exception):
    pass


class Operator:
    operation = None

    def __init__(self, *args):
        self.args = list(args)

    def __str__(self):
        return f"{self.operation}({', '.join(map(str, self.args))})"

    def __repr__(self):
        return f"{self.operation}({', '.join(map(str, self.args))})"

    def __eq__(self, other):
        if not isinstance(other, self.__class__):
            return False

        if not len(self.args) == len(other.args):
            return False

        for i, j in zip(self.args, other.args):
            if i != j:
                return False

        return True


class LogicalOperator(Operator):
    def __init__(self, *operations):
        for operation in operations:
            if not isinstance(operation, Operator):
                raise OperatorError(
                    f"Logical operator arguments must be instances of Operator. Got {operation.__class__.__name__}"
                )
        super().__init__(*operations)


class And(LogicalOperator):
    operation = "and"


class Or(LogicalOperator):
    operation = "or"

    def __or__(self, other):
        if not isinstance(other, self.__class__):
            return NotImplemented

        return Or(*self.args, *other.args)


class Not(LogicalOperator):
    operation = "not"

    def __init__(self, operation: Operator):
        # only one operation allowed
        super().__init__(operation)


class KeyValueOperator(Operator):
    allowed_value_types = ALLOWED_TYPES

    def __init__(self, key, value):
        self.validate_key(key)
        self.validate_value(value)
        super().__init__(key, value)

    @property
    def key(self):
        return self.args[0]

    @property
    def value(self):
        return self.args[1]

    @classmethod
    def validate_key(cls, key):
        if not isinstance(key, str):
            raise OperatorError(f"Key must be a string. Got {key.__class__.__name__}")

    @classmethod
    def validate_value(cls, value):
        # empty string, null
        if not isinstance(value, cls.allowed_value_types):
            raise OperatorError(
                f"Value must be one of {cls.allowed_value_types}. Got {value.__class__.__name__}"
            )


class Eq(KeyValueOperator):
    operation = "eq"


class Gt(KeyValueOperator):
    operation = "gt"


class Ge(KeyValueOperator):
    operation = "ge"


class Lt(KeyValueOperator):
    operation = "lt"


class Le(KeyValueOperator):
    operation = "le"


class In(KeyValueOperator):
    operation = "in"
    allowed_value_types = (list, tuple, set)

    def __init__(self, key, value):
        super().__init__(key, value)
        for v in value:
            self.validate_value(v)


class Co(KeyValueOperator):
    operation = "co"


class Sort:
    def __init__(self, key):
        if not isinstance(key, str):
            raise OperatorError(
                f"Sort key must be a string. Got {key.__class__.__name__}"
            )

        self.ascending = True

        if key[0] == "-":
            self.ascending = False
            key = key[1:]

        elif key[0] == "+":
            key = key[1:]

        self.key = key

    @property
    def descending(self):
        return not self.ascending

    def __str__(self):
        return f"{'-' if not self.ascending else ''}{self.key}"


class FilterQuery:
    def __init__(self, query, sort=None, limit=None, offset=None):
        if not isinstance(query, Operator):
            raise OperatorError(
                f"Query must be an instance of Operator. Got {query.__class__.__name__}"
            )

        if not sort:
            sort = []

        if not isinstance(sort, list):
            raise OperatorError(f"Sort must be a list. Got {sort.__class__.__name__}")

        for s in sort:
            if not isinstance(s, Sort):
                raise OperatorError(
                    f"Sort must be a list of Sort instances. Got {s.__class__.__name__}"
                )

        if limit is not None and not isinstance(limit, int):
            raise OperatorError(
                f"Limit must be an integer. Got {limit.__class__.__name__}"
            )

        if offset is not None and not isinstance(offset, int):
            raise OperatorError(f"Offset must be an integer. Got {offset.__class__}")

        self.query = query
        self.sort = sort
        self.limit = limit
        self.offset = offset
