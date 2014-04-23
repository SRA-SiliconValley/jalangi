import sj

sj.execute(sj.INSTRUMENTATION_SCRIPT+' tests/octane/deltablue.js')
sj.execute(sj.DIRECT_SCRIPT+' --smemory --analysis src/js/analyses/objectalloc/ObjectAllocationTrackerEngineIB.js tests/octane/deltablue_jalangi_.js')

