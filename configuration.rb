BUILD_CONFIGURATION = { 
  :browser =>  {
    # should include jQuery?
    :load_jquery => false,
    
    # list of modules to pack
    :modules => [
                 "./src/js-trees/src/utils.js",
                 "./src/js-trees/src/priority_queue.js",
                 "./src/js-trees/src/web_local_storage_b_tree.js",
                 "./src/js-trees/src/in_memory_b_tree.js",
                 "./src/js-rdf-persistence/src/quad_index_common.js",
                 "./src/js-rdf-persistence/src/quad_index.js",
                 "./src/js-rdf-persistence/src/quad_backend.js",
                 "./src/js-rdf-persistence/src/web_local_storage_lexicon.js",
                 "./src/js-rdf-persistence/src/lexicon.js",
                 "./src/js-sparql-parser/src/abstract_query_tree.js",
                 "./src/js-query-engine/src/query_filters.js",
                 "./src/js-query-engine/src/query_plan_sync_dpsize.js",
                 "./src/js-query-engine/src/query_engine.js",
                 "./src/js-query-engine/src/callbacks.js",
                 # "./src/js-connection/src/rdfstore_client.js",
                 "./src/micrograph/src/micrograph_ql.js",
                 "./src/micrograph/src/micrograph_query.js",
                 "./src/micrograph/src/micrograph_class.js",
                 "./src/micrograph/src/micrograph.js"
                ]
  }
}
