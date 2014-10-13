
import sj
import sys

analyses = ['../src/js/analyses2/dsjs/Dsjs.js']

analysesStr = ' --analysis '+(' --analysis '.join(analyses))

def testDlint (file):
    sj.create_and_cd_jalangi_tmp()
    sj.execute_np(sj.INSTRUMENTATION_SCRIPT+' --initIID ../'+file+'.js')
    out = sj.execute(sj.ANALYSIS2_SCRIPT+ analysesStr+' ../'+file+'_jalangi_.js')
    sj.cd_parent()


testDlint(sys.argv[1]);
