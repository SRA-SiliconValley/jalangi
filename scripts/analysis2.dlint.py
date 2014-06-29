import sj
import sys

sj.create_and_cd_jalangi_tmp()
sj.execute(sj.INSTRUMENTATION_SCRIPT+' ../'+sys.argv[1]+'.js')
sj.execute(sj.ANALYSIS2_SCRIPT+' --analysis ../src/js/analyses2/ChainedAnalyses2.js --analysis ../src/js/analyses2/dlint/UndefinedOffset.js  --analysis ../src/js/analyses2/dlint/CheckNaN.js  --analysis ../src/js/analyses2/dlint/ShadowProtoProperty.js ../'+sys.argv[1]+'_jalangi_.js')
sj.cd_parent()
