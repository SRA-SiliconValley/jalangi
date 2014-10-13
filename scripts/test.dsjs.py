
import sj
import sys

analyses = ['../src/js/analyses2/dsjs/Dsjs.js']

analysesStr = ' --analysis '+(' --analysis '.join(analyses))

def testDlint (file, output):
    sj.create_and_cd_jalangi_tmp()
    sj.execute_np(sj.INSTRUMENTATION_SCRIPT+' --initIID ../tests/dsjs/'+file+'.js')
    out = sj.execute_return_np(sj.ANALYSIS2_SCRIPT+ analysesStr+' ../tests/dsjs/'+file+'_jalangi_.js')
    if output != out:
        print "{} failed".format(file)
        print out
        print output
    else:
        print "{} passed".format(file)
    sj.cd_parent()


out='{"objectTotal":1,"arrayTotal":6,"arrayNonUniform":3,"arrayPropWrite":6,"arrayOutOfBoundNumberPropWrite":3,"arrayNonNumberPropWrite":1}\n'
testDlint('test1array',out)
testDlint('test2array',out)

out = '{"objectTotal":6,"objectPropWrite":11,"objectNewPropWrite":5,"objectHash":4,"objectNonUniformHash":2}\n';
testDlint('test3object',out)

out = '{"objectTotal":2,"objectPropWrite":3,"objectPropRead":1,"objectSuperFunPropRead":1,"objectNewPropWrite":1,"objectHash":1,"objectNonUniformHash":1}\n'
testDlint('test4object',out)

out = '{"objectTotal":2,"objectUsedInForIn":1,"objectPropRead":2}\n';
testDlint('test5object',out)

