import re

class URIError(Exception):
    pass

class Query:
    pass

def parse(query, parameters):
    if query is None:
        query = ''
    term = Query()
    topTerm = term
    topTerm.cache = {}
    topTerm.name = ''

    if isinstance(query, dict):
        if isinstance(query, Query):
            return query
        for i in query:
            term = Query()
            topTerm.args.append(term)
            term.name = "eq"
            term.args = [i, query[i]]
        return topTerm
    if query[0] == "?":
        raise URIError("Query must not start with '?'")
    if True:
        query = query.replace("%3C%3D", "=le=").replace("%3E%3D", "=ge=").replace("%3C", "=lt=").replace("%3E", "=gt=")
    if query.index("/") > -1:
        query = re.sub("[\\+\\*\\$\\-:\\w%\\._]*\\/[\\+\\*\\$\\-:\\w%\\._/]*", lambda slashed: "(" + slashed.group().replace("//", ",") + ")", query)
    query = re.sub(r"(\([^+*$:\w%._,]+\)|[+*$:\w%._]*)([<>!]?=(:?[\\w]*=)?|<>|<)([^+*$:\w%._]*)", 
                   lambda t, property, operator, value: operatorMap[operator] + '(' + property + "," + value + ")", query)
    if query[0] == "?":
        query = query[1:]
    leftoverCharacters = re.sub(r"(\)|[&\|,]?([+\*$:\w%._]*)(\(?)/g", 
                                lambda t, closedParan, delim, propertyOrValue, openParan: "", query)
    if term.parent:
        raise URIError("Opening paranthesis without a closing paranthesis")
    if leftoverCharacters:
        raise URIError("Illegal character in query string encountered " + leftoverCharacters)

def call(newTerm):
    term.args.append(newTerm)
    term = newTerm
    if contains(exports.lastSeen, term.name):
        topTerm.cache[term.name] = term.args

def setConjunction(operator):
    if not term.name:
        term.name = operator
    elif term.name != operator:
        raise Error("Can not mix conjunctions within a group, use paranthesis around each set of same conjuctions (& and |)")

def removeParentProperty(obj):
    if obj and obj.args:
        del obj.parent
        args = obj.args
        for i in range(len(args)):
            removeParentProperty(args[i])
    return obj

removeParentProperty(topTerm)
if not topTerm.name:
    topTerm.name = topTermName
return topTerm
}
