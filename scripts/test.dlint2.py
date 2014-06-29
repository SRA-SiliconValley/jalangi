import sj
import sys

def testDlint (file, output):
    sj.create_and_cd_jalangi_tmp()
    sj.execute_np(sj.INSTRUMENTATION_SCRIPT+' ../tests/dlint/'+file+'.js')
    out = sj.execute_return_np(sj.ANALYSIS2_SCRIPT+' --analysis ../src/js/analyses2/ChainedAnalyses2.js --analysis ../src/js/analyses2/dlint/FunCalledWithMoreArguments.js --analysis ../src/js/analyses2/dlint/UndefinedOffset.js  --analysis ../src/js/analyses2/dlint/CheckNaN.js  --analysis ../src/js/analyses2/dlint/ShadowProtoProperty.js ../tests/dlint/'+file+'_jalangi_.js')
    if output != out:
        print "{} failed".format(file)
        print out
        print output
    else:
        print "{} passed".format(file)
    sj.cd_parent()


out="""Observed NaN at (/Users/ksen/Dropbox/jalangi/tests/dlint/testNaN.js:7:5) 1 time(s).
"""
testDlint('testNaN',out)


out = """Accessed property 'undefined' at (/Users/ksen/Dropbox/jalangi/tests/dlint/dlint1.js:7:1) 1 time(s).
Accessed property 'undefined' at (/Users/ksen/Dropbox/jalangi/tests/dlint/dlint1.js:9:10) 1 time(s).
Written property x at (/Users/ksen/Dropbox/jalangi/tests/dlint/dlint1.js:19:1) 1 time(s) and it shadows the property in its prototype.
"""
testDlint('dlint1',out)


out="""Function at (/Users/ksen/Dropbox/jalangi/tests/dlint/dlint2.js:6:1) called 1 time(s) with more arguments that expected.
Function at (/Users/ksen/Dropbox/jalangi/tests/dlint/dlint2.js:14:1) called 1 time(s) with more arguments that expected.
"""
testDlint('dlint2',out)
