import sj
import sys

analyses = ['../src/js/analyses2/ChainedAnalyses2.js',
 '../src/js/analyses2/dlint/Utils.js',
 '../src/js/analyses2/dlint/CompareFunctionWithPrimitives.js',
 '../src/js/analyses2/dlint/FunCalledWithMoreArguments.js',
 '../src/js/analyses2/dlint/UndefinedOffset.js',
 '../src/js/analyses2/dlint/CheckNaN.js',
 '../src/js/analyses2/dlint/ConcatUndefinedToString.js',
 '../src/js/analyses2/dlint/ShadowProtoProperty.js']

analysesStr = ' --analysis '+(' --analysis '.join(analyses))

def testDlint (file):
    sj.create_and_cd_jalangi_tmp()
    sj.execute(sj.INSTRUMENTATION_SCRIPT+' ../'+file+'.js')
    out = sj.execute(sj.ANALYSIS2_SCRIPT+ analysesStr+' ../'+file+'_jalangi_.js')
    sj.cd_parent()


testDlint(sys.argv[1])
