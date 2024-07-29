
import urllib.parse as urlparse

# Provides a Query constructor with chainable capability
# For example:
# query = Query()
# query.executor = lambda query: require("./js-array").query(query, params, data)  # if we want to operate on an array
# query.eq("a", 3).le("b", 4).forEach(lambda object: None)

def parseQuery(query, params):
    try:
        import promised_io.promise as promise
    except Exception as e:
        promise = lambda value, callback: callback(value)

    class Query:
        def __init__(self, seed=None, params=None):
            if isinstance(seed, str):
                return parseQuery(seed, params)
            q = Query()
            if seed and seed.name and seed.args:
                q.name, q.args = seed.name, seed.args
            return q

    exports = {'Query': Query}
    # export more functions and update query methods
    def queryToString(part):
        if isinstance(part, list):
            return "(" + serializeArgs(part, ",") + ")"
        if part and part.name and part.args:
            return [part.name, "(", serializeArgs(part.args, ","), ")"].join("")

    def encodeString(s):
        if isinstance(s, str):
            s = urlparse.quote(s)
            if any(c in ["(", ")"] for c in s):
                s = s.replace("(", "%28").replace(")", "%29")
        return s

    def encodeValue(val):
        encoded = None
        if val is None:
            val = 'null'
        if val != parser.converters["default"](str(val):
            type_ = type(val)
            if isinstance(val, re.Pattern):
                val = val.pattern
                i = val.rfind('/')
                type_ = "re" if 'i' in val[i:] else "RE"
                val = encodeString(val[1:i])
                encoded = True
            if type_ == "object":
                type_ = "epoch"
                val = val.getTime()
                encoded = True
            if type_ == "string":
                val = encodeString(val)
                encoded = True
            val = ":".join([type_, val])
        if not encoded and type(val) == "string":
            val = encodeString(val)
        return val

    def updateQueryMethods():
        for name in exports.knownOperators:
            def new_method(self, *args):
                newQuery = Query()
                newQuery.executor = self.executor
                newTerm = Query(name)
                newTerm.args = list(args)
                newQuery.args = self.args + [newTerm]
                return newQuery

            setattr(Query, name, new_method)

        for name in exports.knownScalarOperators:
            def new_method(self, *args):
                newQuery = Query()
                newQuery.executor = self.executor
                newTerm = Query(name)
                newTerm.args = list(args)
                newQuery.args = self.args + [newTerm]
                return newQuery.executor(newQuery)

            setattr(Query, name, new_method)

        for name in exports.arrayMethods:
            def new_method(self, *args):
                def callback(results):
                    return getattr(results, name)(*args)
                    
                return promise(self.executor(self), callback)

            setattr(Query, name, new_method)

    exports.updateQueryMethods = updateQueryMethods
    exports.updateQueryMethods()

    return exports

# Recursively iterate over query terms calling 'fn' for each term
Query.walk = lambda self, fn, options=None: None # Implement the walk method

# Append a new term
Query.push = lambda self, term: self.args.append(term)

# Disambiguate query
Query.normalize = lambda self, options=None: None # Implement the normalize method

# An example will be welcome
Query.toMongo = lambda self, options=None: self.normalize({
    'primaryKey': '_id',
    'map': {
        'ge': 'gte',
        'le': 'lte'
    },
    'known': ['lt', 'lte', 'gt', 'gte', 'ne', 'in', 'nin', 'not', 'mod', 'all', 'size', 'exists', 'type', 'elemMatch']
})

exports = parseQuery
return exports
