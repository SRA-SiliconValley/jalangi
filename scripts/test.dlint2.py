import sj
import sys

analyses = ['../src/js/analyses2/ChainedAnalyses2.js',
 '../src/js/analyses2/dlint/Utils.js',
 '../src/js/analyses2/dlint/FunCalledWithMoreArguments.js',
 '../src/js/analyses2/dlint/CompareFunctionWithPrimitives.js',
 '../src/js/analyses2/dlint/UndefinedOffset.js',
 '../src/js/analyses2/dlint/CheckNaN.js',
 '../src/js/analyses2/dlint/ConcatUndefinedToString.js',
 '../src/js/analyses2/dlint/ShadowProtoProperty.js']

analysesStr = ' --analysis '+(' --analysis '.join(analyses))

def testDlint (file, output):
    sj.create_and_cd_jalangi_tmp()
    sj.execute_np(sj.INSTRUMENTATION_SCRIPT+' ../tests/dlint/'+file+'.js')
    out = sj.execute_return_np(sj.ANALYSIS2_SCRIPT+ analysesStr+' ../tests/dlint/'+file+'_jalangi_.js')
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

out="""Concatenated undefined to a string at (/Users/ksen/Dropbox/jalangi/tests/dlint/dlint3.js:6:5) 1 time(s).
Concatenated undefined to a string at (/Users/ksen/Dropbox/jalangi/tests/dlint/dlint3.js:7:5) 1 time(s).
"""
testDlint('dlint3',out)

out="""Comparing a function with a number or string or boolean at (/Users/ksen/Dropbox/jalangi/tests/dlint/dlint4.js:4:5) 1 time(s).
"""
testDlint('dlint4',out)
