# Filters

- filter query language
    - encode / decode in frontend
    - encode / decode in backend
- frontend (table) filter ui
  - conditions (eq, gt, gte, lt, lte, in, contains)
  - combine (AND, OR, NOT), nested
  - store in url or local storage or session storage



REST

/users/_meta
- returns available filters

or within the response ?

https://jsonapi.org/format/#document-meta

***


```
# following https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2
EXPRESSION_MAPPING = {
"eq": "exact",
"co": "contains",
"gt": "gt",
"ge": "gte",
"lt": "lt",
"le": "lte",
}

```
## Cases to consider

- exact, contains, gt, gte, lt, lte, in
- negation
- AND, OR, NOT
- upper, lower, case-insensitive

- +, -, /, *, DIV, MOD
- AND, OR, NOT
- =, !=, <>, >, >=, <, <=, IN, NOT IN, BETWEEN, NOT BETWEEN, LIKE, NOT LIKE, IS, IS NOT

- limit, offset, sort


## ODATA

GET serviceRoot/Airports?$filter=contains(Location/Address, 'San Francisco')

https://www.odata.org/getting-started/basic-tutorial/




jQuery QueryBuilder
```
{
  "condition": "AND",
  "rules": [
    {
      "id": "age",
      "field": "age",
      "type": "double",
      "input": "text",
      "operator": "greater",
      "value": 10
    },
    {
      "id": "contactDetails__firstName",
      "field": "contactDetails__firstName",
      "type": "string",
      "input": "text",
      "operator": "begins_with",
      "value": "a"
    },
    {
      "condition": "AND",
      "rules": [
        {
          "id": "age",
          "field": "age",
          "type": "double",
          "input": "text",
          "operator": "less_or_equal",
          "value": 100
        },
        {
          "id": "contactDetails__firstName",
          "field": "contactDetails__firstName",
          "type": "string",
          "input": "text",
          "operator": "contains",
          "value": "a"
        }
      ]
    }
  ],
  "valid": true
}
```

RQL
```
{
	name: "and",
	args: [
		{
			name:"or",
			args:[
				{
					name:"eq",
					args:["foo",3]
				},
				{
					name:"eq",
					args:["foo","bar"]
				}
			]
		},
		{
			name:"lt",
			args:["price",10]
		}
	]
}

```




https://connect.cloudblue.com/community/developers/api/rql/

# django ql

https://github.com/ivelum/djangoql


# RQL

https://github.com/persvr/rql (10 years ago)

https://www.sitepen.com/blog/resource-query-language-a-query-language-for-the-web-nosql

https://www.javacodegeeks.com/2012/01/simplifying-restful-search.html

The | operator can be used to indicate an "or" operation. We can also use paranthesis to group expressions. For example:
```
(foo=3|foo=bar)&price=lt=10
```
Which is the same as:
```
and(or(eq(foo,3),eq(foo,bar)),lt(price,10))
```
Values in queries can be strings (using URL encoding), numbers, booleans, null, undefined, and dates (in ISO UTC format without colon encoding). We can also denote arrays with paranthesis enclosed, comma separated values. For example to find the objects where foo can be the number 3, the string bar, the boolean true, or the date for the first day of the century we could write an array with the "in" operator:
```
foo=in=(3,bar,true,2000-01-01T00:00:00Z)
```


We can also explicitly specify primitive types in queries. To explicitly specify a string "3", we can do:
```
foo=string:3
```
Any property can be nested by using an array of properties. To search by the bar property of the object in the foo property we can do:
```
(foo,bar)=3
```
We can also use slashes as shorthand for arrays, so we could equivalently write the nested query:
```
foo/bar=3
```
Another common operator is sort. We can use the sort operator to sort by a specified property. To sort by foo in ascending order:
```
price=lt=10&sort(+foo)
```
We can also do multiple property sorts. To sort by price in ascending order and rating in descending order:
```
sort(+price,-rating)
```
The aggregate function can be used for aggregation. To calculate the sum of sales for each department:
```
aggregate(departmentId,sum(sales))
```


Query syntax

A query is made using a combination of field comparisons. Comparisons are composed by a field name, an operator and a value.
Operator 	Meaning 	Examples
== 	Equal to 	name==bob
!= 	Not equal to 	name!=bob
< =lt= 	Less than 	age<30 age=lt=30
<= =le= 	Less than or equal to 	age<=30 age=le=30
> =gt= 	Greater than 	age>30 age=gt=30
>= =ge= 	Greater than or equal to 	age>=30 age=ge=30
=in= 	Belongs to set 	name=in=(bob,kate)
=out= 	Does not belong to set 	name=out=(bob,kate)

Comparisons can traverse model relations by separating field names with a double underscore: father__name==bob.

Values must be quoted with single or double quotes when they include special characters or spaces: name=="bob katz".

Comparisons may be combined using logical operators: ; for a logical AND, and , for a logical OR: name=="bob";age>=30. AND has priority over OR; grouping is available using parentheses: name=="bob";(age>=30,age<3).

Note: RQL/RSQL/FIQL support is still incomplete, it will be enhanced over time.



## URL Search Param equivalent

GET /api/v1/employees?name=John

## URL Search Param lt gt lte gte

GET /api/v1/employees?age__lt=30

GET /api/v1/employees?age__gt=30

GET /api/v1/employees?age__lte=30

GET /api/v1/employees?age__gte=30

## URL Search Param in

GET /api/v1/employees?name__in=John,Smith

## URL Search Param contains

GET /api/v1/employees?name__contains=John





# field queries

- /users/?fields=id,name,email
- /users/?fields=+id
- /users/?fields=-id
- /users/?fields=*group



