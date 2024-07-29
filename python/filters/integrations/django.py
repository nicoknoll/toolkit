import json
import logging
from typing import List, Mapping
from django.db.models import Q, QuerySet
from dataclasses import dataclass
from urllib.parse import unquote_plus

from python.filters.types import FilterQuery

from .. import types as fqt

logger = logging.getLogger(__name__)


# following https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2
EXPRESSION_MAPPING = {
    "eq": "exact",
    "co": "contains",
    "gt": "gt",
    "ge": "gte",
    "lt": "lt",
    "le": "lte",
}


def query_to_q(
    filter_query: FilterQuery,
):
    # recursively replace the filter_query Operations with Q objects
    if isinstance(filter_query, fqt.And):
        and_q = Q()
        for sub_query in filter_query.args:
            and_q &= query_to_q(sub_query)
        return and_q

    if isinstance(filter_query, fqt.Or):
        or_q = Q()
        for sub_query in filter_query.args:
            or_q |= query_to_q(sub_query)
        return or_q

    if isinstance(filter_query, fqt.Not):
        return ~query_to_q(filter_query.args[0])

    if isinstance(filter_query, fqt.Eq):
        return Q(**{filter_query.key: filter_query.value})

    if isinstance(filter_query, fqt.Gt):
        return Q(**{f"{filter_query.key}__gt": filter_query.value})

    if isinstance(filter_query, fqt.Ge):
        return Q(**{f"{filter_query.key}__gte": filter_query.value})

    if isinstance(filter_query, fqt.Lt):
        return Q(**{f"{filter_query.key}__lt": filter_query.value})

    if isinstance(filter_query, fqt.Le):
        return Q(**{f"{filter_query.key}__lte": filter_query.value})

    if isinstance(filter_query, fqt.Co):
        return Q(**{f"{filter_query.key}__contains": filter_query.value})

    raise ValueError(f"Unsupported filter query: {filter_query}")


def filter_queryset(
    qs: QuerySet,
    filter_query: FilterQuery,
):
    """
    Applies the given filters (usually provided by a client via API call arguments) to the django QuerySet by
    transforming them into valid django ORM & extending the original query.
    """
    order_by_filter = None

    if not filters:
        filters = []

    if order_by_filter_name:
        order_by_filter = next(
            (f for f in filters if f.name == order_by_filter_name), None
        )

    if filter_fields is not None:
        filters = [f for f in filters if f.name in filter_fields]

    def _build_filter_query(filter_path, filter_, lookup_exps=None):
        if not lookup_exps:
            lookup_exps = dict()

        lookup_exp = (
            lookup_exps.get(filter_.name)
            or EXPRESSION_MAPPING.get(filter_.expression)
            or default_lookup_exp
        )
        lookup = f"{filter_path}__{lookup_exp}"

        query = Q()

        for v in filter_.value:
            query |= Q(**{lookup: v})

        return query

    def _build_order_by(filter_):
        order_by = []
        for value in filter_.value:
            is_reversed = value.startswith("-")
            value = value[1:] if is_reversed else value
            if value in sort_fields:
                prefix = "-" if is_reversed else ""
                order_by.append(f"{prefix}{sort_fields[value]}")

        return order_by

    # Extend original queryset with filters & sorts
    for filter_ in filters:
        filter_query = _build_filter_query(
            filter_fields[filter_.name], filter_, lookup_exps
        )
        qs = qs.exclude(filter_query) if filter_.exclude else qs.filter(filter_query)

    if order_by_filter:
        order_by = _build_order_by(order_by_filter)
        if order_by:
            qs = qs.order_by(*order_by)

    return qs


class FilterViewSetMixin:
    order_by_fields = []
    fields = []
    lookup_exps = {}

    query_name = "query"

    def get_queryset(self):
        qs = super().get_queryset()
        try:
            filters_json_urlencoded = self.request.query_params.get(self.query_name)
            if not filters_json_urlencoded:
                return qs
            filters = json.loads(unquote_plus(filters_json_urlencoded))
            filters = [TableFilter(**f) for f in filters]
            qs = filter_queryset(
                qs,
                filters,
                filter_fields=dict(
                    [(f, f) if isinstance(f, str) else f for f in self.fields]
                ),
                sort_fields=dict(
                    [(f, f) if isinstance(f, str) else f for f in self.order_by_fields]
                ),
                lookup_exps=self.lookup_exps,
            )
        except Exception as e:
            logger.warn(f"Filters couldn't be applied to queryset: {str(e)}")
        return qs
