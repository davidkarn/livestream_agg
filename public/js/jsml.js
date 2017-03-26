import createElement from 'inferno-create-element'

function flatten(arr) {
    var flattened = []
    for (var i in arr) {
        if (arr[i] instanceof Array)
            flattened = flattened.concat(flatten(arr[i]))
        else if (arr[i])
            flattened.push(arr[i])}
    return flattened }

export default function(klass, attrs) {
    var children = [];
    for (var i = 2; i < arguments.length;i++)
        if (arguments[i]) {
            if (arguments[i] instanceof Array)
                children = children.concat(flatten(arguments[i]))
            else
                children.push(arguments[i]); }
    attrs      = attrs || {}
    attrs.key2 = attrs.key

    var args = [klass, attrs].concat(children);

    return createElement.apply(createElement, args); }
