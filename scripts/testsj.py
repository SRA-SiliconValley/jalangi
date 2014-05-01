import sj

# scripting jalangi sample 1
sj.execute(sj.INSTRUMENTATION_SCRIPT+' tests/octane/deltablue.js')
sj.execute(sj.DIRECT_SCRIPT+' --smemory --analysis src/js/analyses/objectalloc/ObjectAllocationTrackerEngineIB.js tests/octane/deltablue_jalangi_.js')



# scripting jalangi sample 2
sj.create_and_cd_jalangi_tmp()
sj.execute(sj.INSTRUMENTATION_SCRIPT+' ../tests/unit/instrument-test.js')
normal = sj.execute_return('../tests/unit/instrument-test.js', savestderr=True)
sj.mkempty("inputs.js")
rec = sj.execute_return(sj.RECORD_SCRIPT+' ../tests/unit/instrument-test_jalangi_.js', savestderr=True)
rep = sj.execute_return(sj.REPLAY_SCRIPT, savestderr=True)

if normal != rec:
    print "{} failed".format('tests/unit/instrument-test.js')
    print normal
    print rec
    print rep
elif rec != rep:
    print "{} failed".format('tests/unit/instrument-test.js')
    print normal
    print rec
    print rep
else:
    print "{} passed".format('tests/unit/instrument-test.js')
sj.cd_parent()
