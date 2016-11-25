/*jshint esversion:6*/
'use strict';

/**
 * This is the actual sort implementation.
 */
function sort(plugins){
    let graph = createGraph(plugins);
    let stack = weightPriorityByDependencies(plugins, graph, true);

    plugins.map((plugin)=> plugin.priority = stack[plugin.id].priority);

    /*
     * Let's sort our modules based on their
     * collected weight.
     */
    plugins.sort((a, b) => {
        if(a.priority < b.priority) return 1;
    });

    return plugins;
}

/**
 * Provided a list of modules and their
 * dependencies, return an array containing
 * the modules ids ordered so that we can
 * load dependencies first.
 *
 * @argument {Object} graph Object containing modules
 *                          and their dependencies.
 *
 * @argument {Boolean} allowImplicits Should we create
 *                                    missing modules.
 *
 * @return {Array}  List of modules ordered by most
 *                  relied upon first.
 */
function weightPriorityByDependencies(plugins, graph, allowImplicits=true){
    /*
    * store weight for each module
    */
    let stack = {};

    /*
     * Collect all available modules.
     */
    let modules = Object.keys(graph);

    /*
     * All modules start with an
     * equal weight.
     */
    modules.map((id) => stack[id] = {priority: 0});

    /*
     * Collect the weight for each module
     */
    modules.map((id) => weight(stack, id, graph[id]));

    /*
     * Our system might try to recover from
     * missing dependencies elsewhere, like
     * if we support 'global' dependencies
     * handled by require, etc.
     */
    function addMissingDependency(dependency){
        //TODO: review how this should work exactly :P
        plugins[dependency] = {
            id: dependency,
            priority: 1,
            dependencies: [],
            isLocal: false,
            plugin: require(dependency)
        };

        graph[dependency] = [];
        stack[dependency] = 1;
    }

    function weight(stack, id, dependencies=[], i=0){
        if(i > 10) throw Error('Cyclical dependency found: ' + findCyclicDependencies(graph, id));

        if(!dependencies.length) return;

        dependencies.map((dependency) => {
            if(!stack.hasOwnProperty(dependency)){
                if(!allowImplicits) throw new Error('Dependency "' + dependency + '" not a module.');
                addMissingDependency(dependency);
            }

            /*
             * increase the count of the module
             * we are dependent on.
             */
            stack[dependency].priority++;

            /*
             * now, do the same for the dependency's
             * dependencies...
             */
            weight(stack, dependency, graph[dependency], ++i);
        });
    }

    /*
     * If we allow implicits and we actually
     * introduced an implicit dependency we
     * might want to re-generate our module
     * list.
     */
    if(allowImplicits) modules = Object.keys(graph);

    return stack;
}

/**
 * Just go over our graph tree and
 * figure out where it went wrong.
 */
function findCyclicDependencies(graph, identifier) {
    let stack = {};

    function find(id) {
        if (stack.hasOwnProperty(id)) return id === identifier;

        stack[id] = true;

        let found = (graph[id] || []).some(find);

        if (!found) delete stack[id];

        return found;
    }

    return find(identifier) ? Object.keys(stack).concat(identifier) : undefined;
}

/**
 * Build a structure that is easier
 * to work with.
 */
function createGraph(plugins){
    let out = {};
    plugins.map((plugin)=>{
        out[plugin.id] = plugin.dependencies || [];
    });
    return out;
}

module.exports = sort;
module.exports.createGraph = createGraph;
module.exports.findCyclicDependencies = findCyclicDependencies;
module.exports.weightPriorityByDependencies = weightPriorityByDependencies;
