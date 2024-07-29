from python.filters.types import FilterQuery


class BaseParser:
    def __init__(self, query: str):
        self.query = query

    def parse(self) -> FilterQuery:
        raise NotImplementedError()
