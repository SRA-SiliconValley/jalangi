if (typeof window === 'undefined') {
    require('/Users/koushik.sen/Dropbox/jalangi/src/js/analysis.js');
    require('/Users/koushik.sen/Dropbox/jalangi/src/js/InputManager.js');
    require('/Users/koushik.sen/Dropbox/jalangi/src/js/instrument/esnstrument.js');
    require(process.cwd() + '/inputs.js');
}
{
    try {
        $7.Se(11097, 'tests/tizen/annex/js/annex_jalangi_.js');
        $7.N(11101, 'World', World, false);
        $7.N(11109, 'getMessage', $7.T(11105, getMessage, 12), false);
        var World = $7.W(9637, 'World', $7.F(9633, $7.T(9629, function () {
                jalangiLabel30:
                    while (true) {
                        try {
                            $7.Fe(9617, arguments.callee, this);
                            $7.N(9621, 'arguments', arguments, true);
                            $7.N(9625, 'w', w, false);
                            var w = $7.W(9605, 'w', $7.T(9601, {
                                    boardTexture: $7.T(37, {
                                        board: $7.T(5, 'images/game_014_board.png', 21),
                                        black: $7.T(9, 'images/game_002_blackpc.png', 21),
                                        white: $7.T(13, 'images/game_003_whitepc.png', 21),
                                        leftPieces: $7.T(17, 'images/game_004_pcleftside.png', 21),
                                        rightPieces: $7.T(21, 'images/game_005_pcrightside.png', 21),
                                        hidePieces: $7.T(25, 'images/game_015_pcside.png', 21),
                                        p1Image: $7.T(29, 'images/game_011_settings1p.png', 21),
                                        p2Image: $7.T(33, 'images/game_010_settings2p.png', 21)
                                    }, 11),
                                    board: $7.T(73, [
                                        $7.T(41, [], 10),
                                        $7.T(45, [], 10),
                                        $7.T(49, [], 10),
                                        $7.T(53, [], 10),
                                        $7.T(57, [], 10),
                                        $7.T(61, [], 10),
                                        $7.T(65, [], 10),
                                        $7.T(69, [], 10)
                                    ], 10),
                                    bounder: $7.T(77, 8, 22),
                                    boardview: $7.T(81, 'board', 21),
                                    blackResultView: $7.T(85, 'black_result', 21),
                                    whiteResultView: $7.T(89, 'white_result', 21),
                                    leftPiecesView: $7.T(93, 'left_pieces', 21),
                                    rightPiecesView: $7.T(97, 'right_pieces', 21),
                                    messageview: $7.T(101, 'message', 21),
                                    result: $7.T(105, 'result', 21),
                                    isEnd: $7.T(109, false, 23),
                                    endMessage: $7.T(113, '', 21),
                                    isUserTurn: $7.T(117, true, 23),
                                    isDrawing: $7.T(121, false, 23),
                                    isLock: $7.T(125, false, 23),
                                    isInit: $7.T(129, false, 23),
                                    isConfigure: $7.T(133, false, 23),
                                    isResult: $7.T(137, false, 23),
                                    level: $7.T(141, 3, 22),
                                    playerNum: $7.T(145, 1, 22),
                                    currentColor: $7.T(149, 'black', 21),
                                    step: $7.T(153, 4, 22),
                                    point: $7.T(157, [], 10),
                                    directs: $7.T(257, [
                                        $7.T(169, [
                                            $7.T(161, 1, 22),
                                            $7.T(165, 0, 22)
                                        ], 10),
                                        $7.T(181, [
                                            $7.T(173, 1, 22),
                                            $7.T(177, 1, 22)
                                        ], 10),
                                        $7.T(193, [
                                            $7.T(185, 1, 22),
                                            $7.U(6, '-', $7.T(189, 1, 22))
                                        ], 10),
                                        $7.T(205, [
                                            $7.T(197, 0, 22),
                                            $7.T(201, 1, 22)
                                        ], 10),
                                        $7.T(217, [
                                            $7.T(209, 0, 22),
                                            $7.U(10, '-', $7.T(213, 1, 22))
                                        ], 10),
                                        $7.T(229, [
                                            $7.U(14, '-', $7.T(221, 1, 22)),
                                            $7.T(225, 0, 22)
                                        ], 10),
                                        $7.T(241, [
                                            $7.U(18, '-', $7.T(233, 1, 22)),
                                            $7.T(237, 1, 22)
                                        ], 10),
                                        $7.T(253, [
                                            $7.U(22, '-', $7.T(245, 1, 22)),
                                            $7.U(26, '-', $7.T(249, 1, 22))
                                        ], 10)
                                    ], 10),
                                    heap: $7.T(265, { 'nextLevel': $7.T(261, {}, 11) }, 11),
                                    soundSource: $7.T(333, {
                                        'snd_hint': $7.T(273, { 'src': $7.T(269, 'sounds/Hint.ogg', 21) }, 11),
                                        'snd_navclick': $7.T(281, { 'src': $7.T(277, 'sounds/NavClick.ogg', 21) }, 11),
                                        'snd_navmove': $7.T(289, { 'src': $7.T(285, 'sounds/NavMove.ogg', 21) }, 11),
                                        'snd_settingsclick': $7.T(297, { 'src': $7.T(293, 'sounds/SettingsClick.ogg', 21) }, 11),
                                        'snd_theme': $7.T(305, { 'src': $7.T(301, 'sounds/Theme.ogg', 21) }, 11),
                                        'snd_tileflip': $7.T(313, { 'src': $7.T(309, 'sounds/TileFlip.ogg', 21) }, 11),
                                        'snd_tileplace': $7.T(321, { 'src': $7.T(317, 'sounds/TilePlace.ogg', 21) }, 11),
                                        'snd_victoryhorns': $7.T(329, { 'src': $7.T(325, 'sounds/VictoryHorns.ogg', 21) }, 11)
                                    }, 11),
                                    init: $7.T(1337, function (play) {
                                        jalangiLabel0:
                                            while (true) {
                                                try {
                                                    $7.Fe(1305, arguments.callee, this);
                                                    $7.N(1309, 'arguments', arguments, true);
                                                    $7.N(1313, 'play', play, true);
                                                    $7.N(1317, 'i', i, false);
                                                    $7.N(1321, 'j', j, false);
                                                    $7.N(1325, 'strLeft', strLeft, false);
                                                    $7.N(1329, 'strRight', strRight, false);
                                                    $7.N(1333, 'n', n, false);
                                                    $7.P(349, $7.R(337, 'this', this), 'playerNum', $7.C(4, $7.R(341, 'play', play)) ? $7._() : $7.T(345, 1, 22));
                                                    for (var i in $7.H(417, $7.G(357, $7.R(353, 'this', this), 'board'))) {
                                                        for (var j = $7.W(365, 'j', $7.T(361, 0, 22), j); $7.C(8, $7.B(30, '<', $7.R(369, 'j', j), $7.G(377, $7.R(373, 'this', this), 'bounder'))); $7.B(38, '-', j = $7.W(385, 'j', $7.B(34, '+', $7.R(381, 'j', j), 1), j), 1)) {
                                                            $7.P(413, $7.G(401, $7.G(393, $7.R(389, 'this', this), 'board'), $7.R(397, 'i', i)), $7.R(405, 'j', j), $7.T(409, 'board', 21));
                                                        }
                                                    }
                                                    $7.P(445, $7.G(433, $7.G(425, $7.R(421, 'this', this), 'board'), $7.T(429, 3, 22)), $7.T(437, 3, 22), $7.T(441, 'black', 21));
                                                    $7.P(473, $7.G(461, $7.G(453, $7.R(449, 'this', this), 'board'), $7.T(457, 4, 22)), $7.T(465, 4, 22), $7.T(469, 'black', 21));
                                                    $7.P(501, $7.G(489, $7.G(481, $7.R(477, 'this', this), 'board'), $7.T(485, 3, 22)), $7.T(493, 4, 22), $7.T(497, 'white', 21));
                                                    $7.P(529, $7.G(517, $7.G(509, $7.R(505, 'this', this), 'board'), $7.T(513, 4, 22)), $7.T(521, 3, 22), $7.T(525, 'white', 21));
                                                    $7.P(541, $7.R(533, 'this', this), 'isUserTurn', $7.T(537, true, 23));
                                                    $7.P(553, $7.R(545, 'this', this), 'isLock', $7.T(549, false, 23));
                                                    $7.P(565, $7.R(557, 'this', this), 'isConfigure', $7.T(561, false, 23));
                                                    $7.P(577, $7.R(569, 'this', this), 'isResult', $7.T(573, false, 23));
                                                    $7.P(589, $7.R(581, 'this', this), 'currentColor', $7.T(585, 'white', 21));
                                                    $7.P(601, $7.R(593, 'this', this), 'step', $7.T(597, 4, 22));
                                                    $7.P(613, $7.R(605, 'this', this), 'level', $7.T(609, 3, 22));
                                                    $7.P(625, $7.R(617, 'this', this), 'poing', $7.T(621, [], 10));
                                                    $7.P(641, $7.R(629, 'this', this), 'heap', $7.T(637, { 'nextLevel': $7.T(633, {}, 11) }, 11));
                                                    var strLeft = $7.W(649, 'strLeft', $7.T(645, '', 21), strLeft);
                                                    var strRight = $7.W(657, 'strRight', $7.T(653, '', 21), strRight);
                                                    for (var i = $7.W(665, 'i', $7.T(661, 0, 22), i); $7.C(12, $7.B(42, '<', $7.R(669, 'i', i), $7.T(673, 32, 22))); $7.B(50, '-', i = $7.W(681, 'i', $7.B(46, '+', $7.R(677, 'i', i), 1), i), 1)) {
                                                        strLeft = $7.W(721, 'strLeft', $7.B(70, '+', $7.R(717, 'strLeft', strLeft), $7.B(66, '+', $7.B(62, '+', $7.B(58, '+', $7.B(54, '+', $7.T(685, '<img src="', 21), $7.G(701, $7.G(693, $7.R(689, 'this', this), 'boardTexture'), $7.T(697, 'leftPieces', 21))), $7.T(705, '" class="pieces" id="pc0', 21)), $7.R(709, 'i', i)), $7.T(713, '" />', 21))), strLeft);
                                                        strRight = $7.W(761, 'strRight', $7.B(90, '+', $7.R(757, 'strRight', strRight), $7.B(86, '+', $7.B(82, '+', $7.B(78, '+', $7.B(74, '+', $7.T(725, '<img src="', 21), $7.G(741, $7.G(733, $7.R(729, 'this', this), 'boardTexture'), $7.T(737, 'rightPieces', 21))), $7.T(745, '" class="pieces" id="pc1', 21)), $7.R(749, 'i', i)), $7.T(753, '" />', 21))), strRight);
                                                    }
                                                    $7.M(789, $7.F(781, $7.I(typeof $ === 'undefined' ? $7.R(765, '$', undefined) : $7.R(765, '$', $)), false)($7.B(94, '+', $7.T(769, '#', 21), $7.G(777, $7.R(773, 'this', this), 'leftPiecesView'))), 'html', false)($7.R(785, 'strLeft', strLeft));
                                                    $7.M(817, $7.F(809, $7.I(typeof $ === 'undefined' ? $7.R(793, '$', undefined) : $7.R(793, '$', $)), false)($7.B(98, '+', $7.T(797, '#', 21), $7.G(805, $7.R(801, 'this', this), 'rightPiecesView'))), 'html', false)($7.R(813, 'strRight', strRight));
                                                    $7.M(853, $7.F(829, $7.I(typeof $ === 'undefined' ? $7.R(821, '$', undefined) : $7.R(821, '$', $)), false)($7.T(825, '#pc00', 21)), 'attr', false)($7.T(833, 'src', 21), $7.G(849, $7.G(841, $7.R(837, 'this', this), 'boardTexture'), $7.T(845, 'hidePieces', 21)));
                                                    $7.M(889, $7.F(865, $7.I(typeof $ === 'undefined' ? $7.R(857, '$', undefined) : $7.R(857, '$', $)), false)($7.T(861, '#pc01', 21)), 'attr', false)($7.T(869, 'src', 21), $7.G(885, $7.G(877, $7.R(873, 'this', this), 'boardTexture'), $7.T(881, 'hidePieces', 21)));
                                                    $7.M(925, $7.F(901, $7.I(typeof $ === 'undefined' ? $7.R(893, '$', undefined) : $7.R(893, '$', $)), false)($7.T(897, '#pc10', 21)), 'attr', false)($7.T(905, 'src', 21), $7.G(921, $7.G(913, $7.R(909, 'this', this), 'boardTexture'), $7.T(917, 'hidePieces', 21)));
                                                    $7.M(961, $7.F(937, $7.I(typeof $ === 'undefined' ? $7.R(929, '$', undefined) : $7.R(929, '$', $)), false)($7.T(933, '#pc11', 21)), 'attr', false)($7.T(941, 'src', 21), $7.G(957, $7.G(949, $7.R(945, 'this', this), 'boardTexture'), $7.T(953, 'hidePieces', 21)));
                                                    $7.M(989, $7.F(981, $7.I(typeof $ === 'undefined' ? $7.R(965, '$', undefined) : $7.R(965, '$', $)), false)($7.B(102, '+', $7.T(969, '#', 21), $7.G(977, $7.R(973, 'this', this), 'result'))), 'addClass', false)($7.T(985, 'display_none', 21));
                                                    $7.M(1009, $7.F(1001, $7.I(typeof $ === 'undefined' ? $7.R(993, '$', undefined) : $7.R(993, '$', $)), false)($7.T(997, 'div.configure_panel', 21)), 'addClass', false)($7.T(1005, 'display_none', 21));
                                                    var n = $7.W(1033, 'n', $7.C(16, $7.B(106, '==', $7.G(1017, $7.R(1013, 'this', this), 'playerNum'), $7.T(1021, 1, 22))) ? $7.T(1025, 2, 22) : $7.T(1029, 1, 22), n);
                                                    $7.M(1117, $7.M(1089, $7.M(1081, $7.M(1065, $7.F(1045, $7.I(typeof $ === 'undefined' ? $7.R(1037, '$', undefined) : $7.R(1037, '$', $)), false)($7.T(1041, '.configure_panel_newgame', 21)), 'removeClass', false)($7.B(114, '+', $7.B(110, '+', $7.T(1049, 'configure_panel_new', 21), $7.G(1057, $7.R(1053, 'this', this), 'playerNum')), $7.T(1061, 'game', 21))), 'addClass', false)($7.B(122, '+', $7.B(118, '+', $7.T(1069, 'configure_panel_new', 21), $7.R(1073, 'n', n)), $7.T(1077, 'game', 21))), 'find', false)($7.T(1085, '.configure_panel_text', 21)), 'html', false)($7.F(1113, $7.R(1093, 'getMessage', getMessage), false)($7.B(126, '+', $7.R(1097, 'n', n), $7.T(1101, 'PlayerGame', 21)), $7.B(130, '+', $7.R(1105, 'n', n), $7.T(1109, ' Player Game', 21))));
                                                    $7.M(1153, $7.F(1129, $7.I(typeof $ === 'undefined' ? $7.R(1121, '$', undefined) : $7.R(1121, '$', $)), false)($7.T(1125, '.play1_lable', 21)), 'html', false)($7.B(134, '+', $7.F(1145, $7.R(1133, 'getMessage', getMessage), false)($7.T(1137, 'player', 21), $7.T(1141, 'player', 21)), $7.T(1149, '<span style="font-size:48pt;">1</span>', 21)));
                                                    if ($7.C(20, $7.B(138, '==', $7.G(1161, $7.R(1157, 'this', this), 'playerNum'), $7.T(1165, 2, 22)))) {
                                                        $7.M(1201, $7.F(1177, $7.I(typeof $ === 'undefined' ? $7.R(1169, '$', undefined) : $7.R(1169, '$', $)), false)($7.T(1173, '.play2_lable', 21)), 'html', false)($7.B(142, '+', $7.F(1193, $7.R(1181, 'getMessage', getMessage), false)($7.T(1185, 'player', 21), $7.T(1189, 'player', 21)), $7.T(1197, '<span style="font-size:48pt;">2</span>', 21)));
                                                    } else {
                                                        $7.M(1233, $7.F(1213, $7.I(typeof $ === 'undefined' ? $7.R(1205, '$', undefined) : $7.R(1205, '$', $)), false)($7.T(1209, '.play2_lable', 21)), 'html', false)($7.F(1229, $7.R(1217, 'getMessage', getMessage), false)($7.T(1221, 'computer', 21), $7.T(1225, 'comp.', 21)));
                                                    }
                                                    $7.P(1245, $7.R(1237, 'this', this), 'isInit', $7.T(1241, true, 23));
                                                    $7.M(1265, $7.F(1257, $7.I(typeof $ === 'undefined' ? $7.R(1249, '$', undefined) : $7.R(1249, '$', $)), false)($7.T(1253, '#open', 21)), 'addClass', false)($7.T(1261, 'display_none', 21));
                                                    $7.M(1285, $7.F(1277, $7.I(typeof $ === 'undefined' ? $7.R(1269, '$', undefined) : $7.R(1269, '$', $)), false)($7.T(1273, '#view', 21)), 'removeClass', false)($7.T(1281, 'display_none', 21));
                                                    $7.M(1293, $7.R(1289, 'this', this), 'endConfigure', false)();
                                                    $7.M(1301, $7.R(1297, 'this', this), 'drawBoard', false)();
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11117))
                                                        continue jalangiLabel0;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    configure: $7.T(1465, function () {
                                        jalangiLabel1:
                                            while (true) {
                                                try {
                                                    $7.Fe(1457, arguments.callee, this);
                                                    $7.N(1461, 'arguments', arguments, true);
                                                    if ($7.C(40, $7.C(32, $7.U(146, '!', $7.G(1345, $7.R(1341, 'this', this), 'isLock'))) ? $7._() : $7.C(28, $7.C(24, $7.G(1353, $7.R(1349, 'this', this), 'isEnd')) ? $7.G(1361, $7.R(1357, 'this', this), 'isLock') : $7._()) ? $7.U(150, '!', $7.G(1369, $7.R(1365, 'this', this), 'isResult')) : $7._())) {
                                                        $7.M(1381, $7.R(1373, 'this', this), 'playSound', false)($7.T(1377, 'snd_settingsclick', 21));
                                                        if ($7.C(36, $7.U(154, '!', $7.G(1389, $7.R(1385, 'this', this), 'isConfigure')))) {
                                                            $7.P(1401, $7.R(1393, 'this', this), 'isConfigure', $7.T(1397, true, 23));
                                                            $7.M(1425, $7.F(1413, $7.I(typeof $ === 'undefined' ? $7.R(1405, '$', undefined) : $7.R(1405, '$', $)), false)($7.T(1409, 'a.configure img', 21)), 'attr', false)($7.T(1417, 'src', 21), $7.T(1421, 'images/game_007_settingsbtnrollover.png', 21));
                                                            $7.M(1445, $7.F(1437, $7.I(typeof $ === 'undefined' ? $7.R(1429, '$', undefined) : $7.R(1429, '$', $)), false)($7.T(1433, 'div.configure_panel', 21)), 'removeClass', false)($7.T(1441, 'display_none', 21));
                                                        } else {
                                                            $7.M(1453, $7.R(1449, 'this', this), 'endConfigure', false)();
                                                        }
                                                    }
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11121))
                                                        continue jalangiLabel1;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    endConfigure: $7.T(1533, function () {
                                        jalangiLabel2:
                                            while (true) {
                                                try {
                                                    $7.Fe(1525, arguments.callee, this);
                                                    $7.N(1529, 'arguments', arguments, true);
                                                    $7.P(1477, $7.R(1469, 'this', this), 'isConfigure', $7.T(1473, false, 23));
                                                    $7.M(1497, $7.F(1489, $7.I(typeof $ === 'undefined' ? $7.R(1481, '$', undefined) : $7.R(1481, '$', $)), false)($7.T(1485, 'div.configure_panel', 21)), 'addClass', false)($7.T(1493, 'display_none', 21));
                                                    $7.M(1521, $7.F(1509, $7.I(typeof $ === 'undefined' ? $7.R(1501, '$', undefined) : $7.R(1501, '$', $)), false)($7.T(1505, 'a.configure img', 21)), 'attr', false)($7.T(1513, 'src', 21), $7.T(1517, 'images/game_006_settingsbtn.png', 21));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11125))
                                                        continue jalangiLabel2;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    startOver: $7.T(1581, function () {
                                        jalangiLabel3:
                                            while (true) {
                                                try {
                                                    $7.Fe(1573, arguments.callee, this);
                                                    $7.N(1577, 'arguments', arguments, true);
                                                    $7.M(1545, $7.R(1537, 'this', this), 'playSound', false)($7.T(1541, 'snd_navclick', 21));
                                                    $7.M(1561, $7.R(1549, 'this', this), 'init', false)($7.G(1557, $7.R(1553, 'this', this), 'playerNum'));
                                                    $7.M(1569, $7.R(1565, 'this', this), 'endConfigure', false)();
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11129))
                                                        continue jalangiLabel3;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    showHelp: $7.T(1633, function () {
                                        jalangiLabel4:
                                            while (true) {
                                                try {
                                                    $7.Fe(1625, arguments.callee, this);
                                                    $7.N(1629, 'arguments', arguments, true);
                                                    $7.M(1593, $7.R(1585, 'this', this), 'playSound', false)($7.T(1589, 'snd_navclick', 21));
                                                    $7.M(1601, $7.R(1597, 'this', this), 'endConfigure', false)();
                                                    $7.M(1621, $7.F(1613, $7.I(typeof $ === 'undefined' ? $7.R(1605, '$', undefined) : $7.R(1605, '$', $)), false)($7.T(1609, '#help', 21)), 'removeClass', false)($7.T(1617, 'display_none', 21));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11133))
                                                        continue jalangiLabel4;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    exitHelp: $7.T(1677, function () {
                                        jalangiLabel5:
                                            while (true) {
                                                try {
                                                    $7.Fe(1669, arguments.callee, this);
                                                    $7.N(1673, 'arguments', arguments, true);
                                                    $7.M(1645, $7.R(1637, 'this', this), 'playSound', false)($7.T(1641, 'snd_navclick', 21));
                                                    $7.M(1665, $7.F(1657, $7.I(typeof $ === 'undefined' ? $7.R(1649, '$', undefined) : $7.R(1649, '$', $)), false)($7.T(1653, '#help', 21)), 'addClass', false)($7.T(1661, 'display_none', 21));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11137))
                                                        continue jalangiLabel5;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    getSoundSource: $7.T(2021, function (snd) {
                                        jalangiLabel6:
                                            while (true) {
                                                try {
                                                    $7.Fe(1989, arguments.callee, this);
                                                    $7.N(1993, 'arguments', arguments, true);
                                                    $7.N(1997, 'snd', snd, true);
                                                    $7.N(2001, 'ret', ret, false);
                                                    $7.N(2005, 'source', source, false);
                                                    $7.N(2009, 'p', p, false);
                                                    $7.N(2013, 'step', step, false);
                                                    $7.N(2017, 'src', src, false);
                                                    var ret;
                                                    if ($7.C(48, $7.C(44, $7.B(162, '!=', $7.U(158, 'typeof', $7.G(1693, $7.G(1685, $7.R(1681, 'this', this), 'soundSource'), $7.R(1689, 'snd', snd))), $7.T(1697, 'undefined', 21))) ? $7.B(170, '!=', $7.U(166, 'typeof', $7.G(1721, $7.G(1713, $7.G(1705, $7.R(1701, 'this', this), 'soundSource'), $7.R(1709, 'snd', snd)), $7.T(1717, 'audio', 21))), $7.T(1725, 'undefined', 21)) : $7._())) {
                                                        var source = $7.W(1745, 'source', $7.G(1741, $7.G(1733, $7.R(1729, 'this', this), 'soundSource'), $7.R(1737, 'snd', snd)), source);
                                                        var p = $7.W(1769, 'p', $7.F(1765, $7.I(typeof parseInt === 'undefined' ? $7.R(1749, 'parseInt', undefined) : $7.R(1749, 'parseInt', parseInt)), false)($7.G(1761, $7.R(1753, 'source', source), $7.T(1757, 'point', 21))), p);
                                                        var step = $7.W(1797, 'step', $7.F(1793, $7.I(typeof parseInt === 'undefined' ? $7.R(1773, 'parseInt', undefined) : $7.R(1773, 'parseInt', parseInt)), false)($7.G(1789, $7.G(1785, $7.R(1777, 'source', source), $7.T(1781, 'audio', 21)), 'length')), step);
                                                        ret = $7.W(1821, 'ret', $7.G(1817, $7.G(1809, $7.R(1801, 'source', source), $7.T(1805, 'audio', 21)), $7.R(1813, 'p', p)), ret);
                                                        $7.P(1857, $7.G(1837, $7.G(1829, $7.R(1825, 'this', this), 'soundSource'), $7.R(1833, 'snd', snd)), $7.T(1841, 'point', 21), $7.B(178, '%', $7.B(174, '+', $7.R(1845, 'p', p), $7.T(1849, 1, 22)), $7.R(1853, 'step', step)));
                                                    } else {
                                                        var src = $7.W(1885, 'src', $7.G(1881, $7.G(1873, $7.G(1865, $7.R(1861, 'this', this), 'soundSource'), $7.R(1869, 'snd', snd)), $7.T(1877, 'src', 21)), src);
                                                        ret = $7.W(1901, 'ret', $7.M(1897, $7.I(typeof document === 'undefined' ? $7.R(1889, 'document', undefined) : $7.R(1889, 'document', document)), 'getElementById', false)($7.R(1893, 'snd', snd)), ret);
                                                        $7.P(1949, $7.G(1917, $7.G(1909, $7.R(1905, 'this', this), 'soundSource'), $7.R(1913, 'snd', snd)), $7.T(1921, 'audio', 21), $7.T(1945, [
                                                            $7.R(1925, 'ret', ret),
                                                            $7.T(1941, $7.F(1937, $7.I(typeof Audio === 'undefined' ? $7.R(1929, 'Audio', undefined) : $7.R(1929, 'Audio', Audio)), true)($7.R(1933, 'src', src)), 11)
                                                        ], 10));
                                                        $7.P(1977, $7.G(1965, $7.G(1957, $7.R(1953, 'this', this), 'soundSource'), $7.R(1961, 'snd', snd)), $7.T(1969, 'point', 21), $7.T(1973, 0, 22));
                                                    }
                                                    return $7.Rt(1985, $7.R(1981, 'ret', ret));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11141))
                                                        continue jalangiLabel6;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    playSound: $7.T(2085, function (snd) {
                                        jalangiLabel7:
                                            while (true) {
                                                try {
                                                    $7.Fe(2069, arguments.callee, this);
                                                    $7.N(2073, 'arguments', arguments, true);
                                                    $7.N(2077, 'snd', snd, true);
                                                    $7.N(2081, 'audio', audio, false);
                                                    var audio = $7.W(2037, 'audio', $7.M(2033, $7.R(2025, 'this', this), 'getSoundSource', false)($7.R(2029, 'snd', snd)), audio);
                                                    if ($7.C(52, $7.B(182, '==', $7.G(2045, $7.R(2041, 'audio', audio), 'paused'), $7.T(2049, false, 23)))) {
                                                        $7.M(2057, $7.R(2053, 'audio', audio), 'pause', false)();
                                                    }
                                                    $7.M(2065, $7.R(2061, 'audio', audio), 'play', false)();
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11145))
                                                        continue jalangiLabel7;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    actionAtPoint: $7.T(2533, function (place, color) {
                                        jalangiLabel8:
                                            while (true) {
                                                try {
                                                    $7.Fe(2509, arguments.callee, this);
                                                    $7.N(2513, 'arguments', arguments, true);
                                                    $7.N(2517, 'place', place, true);
                                                    $7.N(2521, 'color', color, true);
                                                    $7.N(2525, 'path', path, false);
                                                    $7.N(2529, 'act', act, false);
                                                    var path = $7.W(2093, 'path', $7.T(2089, [], 10), path);
                                                    $7.P(2165, $7.R(2097, 'this', this), 'heap', $7.C(56, $7.G(2157, $7.G(2113, $7.G(2105, $7.R(2101, 'this', this), 'heap'), $7.T(2109, 'nextLevel', 21)), $7.B(186, '+', $7.F(2133, $7.I(typeof String === 'undefined' ? $7.R(2117, 'String', undefined) : $7.R(2117, 'String', String)), false)($7.G(2129, $7.R(2121, 'place', place), $7.T(2125, 0, 22))), $7.F(2153, $7.I(typeof String === 'undefined' ? $7.R(2137, 'String', undefined) : $7.R(2137, 'String', String)), false)($7.G(2149, $7.R(2141, 'place', place), $7.T(2145, 1, 22)))))) ? $7._() : $7.T(2161, {}, 11));
                                                    if ($7.C(64, $7.C(60, $7.B(194, '!=', $7.U(190, 'typeof', $7.G(2181, $7.G(2173, $7.R(2169, 'this', this), 'heap'), $7.T(2177, 'value', 21))), $7.T(2185, 'undefined', 21))) ? $7.B(198, '==', $7.G(2201, $7.G(2193, $7.R(2189, 'this', this), 'heap'), $7.T(2197, 'color', 21)), $7.R(2205, 'color', color)) : $7._())) {
                                                        path = $7.W(2225, 'path', $7.G(2221, $7.G(2213, $7.R(2209, 'this', this), 'heap'), $7.T(2217, 'path', 21)), path);
                                                    } else {
                                                        var act = $7.W(2245, 'act', $7.M(2241, $7.R(2229, 'this', this), 'getRevertPath', false)($7.R(2233, 'place', place), $7.R(2237, 'color', color)), act);
                                                        path = $7.W(2261, 'path', $7.G(2257, $7.R(2249, 'act', act), $7.T(2253, 'path', 21)), path);
                                                        $7.P(2289, $7.R(2265, 'this', this), 'heap', $7.T(2285, {
                                                            'color': $7.R(2269, 'color', color),
                                                            'path': $7.R(2273, 'path', path),
                                                            'place': $7.R(2277, 'place', place),
                                                            'nextLevel': $7.T(2281, {}, 11)
                                                        }, 11));
                                                    }
                                                    $7.M(2297, $7.R(2293, 'this', this), 'clearTips', false)();
                                                    $7.M(2365, $7.F(2341, $7.I(typeof $ === 'undefined' ? $7.R(2301, '$', undefined) : $7.R(2301, '$', $)), false)($7.B(214, '+', $7.B(206, '+', $7.T(2305, '#pc', 21), $7.B(202, '%', $7.G(2313, $7.R(2309, 'this', this), 'step'), $7.T(2317, 2, 22))), $7.M(2337, $7.I(typeof Math === 'undefined' ? $7.R(2321, 'Math', undefined) : $7.R(2321, 'Math', Math)), 'floor', false)($7.B(210, '/', $7.G(2329, $7.R(2325, 'this', this), 'step'), $7.T(2333, 2, 22))))), 'attr', false)($7.T(2345, 'src', 21), $7.G(2361, $7.G(2353, $7.R(2349, 'this', this), 'boardTexture'), $7.T(2357, 'hidePieces', 21)));
                                                    $7.A(2377, $7.R(2369, 'this', this), 'step', '+')($7.T(2373, 1, 22));
                                                    if ($7.C(76, $7.B(218, '>=', $7.G(2385, $7.R(2381, 'this', this), 'step'), $7.T(2389, 50, 22))))
                                                        $7.A(2401, $7.R(2393, 'this', this), 'level', '+')($7.T(2397, 1, 22));
                                                    else if ($7.C(72, $7.B(222, '>=', $7.G(2409, $7.R(2405, 'this', this), 'setp'), $7.T(2413, 53, 22))))
                                                        $7.A(2425, $7.R(2417, 'this', this), 'level', '+')($7.T(2421, 1, 22));
                                                    else if ($7.C(68, $7.B(226, '>=', $7.G(2433, $7.R(2429, 'this', this), 'step'), $7.T(2437, 55, 22))))
                                                        $7.A(2449, $7.R(2441, 'this', this), 'level', '+')($7.T(2445, 2, 22));
                                                    $7.M(2461, $7.R(2453, 'this', this), 'playSound', false)($7.T(2457, 'snd_tileplace', 21));
                                                    $7.M(2477, $7.R(2465, 'this', this), 'setPoint', false)($7.R(2469, 'place', place), $7.R(2473, 'color', color));
                                                    $7.M(2489, $7.R(2481, 'this', this), 'setBorder', false)($7.R(2485, 'place', place));
                                                    $7.M(2505, $7.R(2493, 'this', this), 'drawPath', false)($7.R(2497, 'path', path), $7.R(2501, 'color', color));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11149))
                                                        continue jalangiLabel8;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    setPoint: $7.T(2613, function (place, color) {
                                        jalangiLabel9:
                                            while (true) {
                                                try {
                                                    $7.Fe(2597, arguments.callee, this);
                                                    $7.N(2601, 'arguments', arguments, true);
                                                    $7.N(2605, 'place', place, true);
                                                    $7.N(2609, 'color', color, true);
                                                    $7.P(2577, $7.G(2557, $7.G(2541, $7.R(2537, 'this', this), 'board'), $7.G(2553, $7.R(2545, 'place', place), $7.T(2549, 0, 22))), $7.G(2569, $7.R(2561, 'place', place), $7.T(2565, 1, 22)), $7.R(2573, 'color', color));
                                                    $7.M(2593, $7.R(2581, 'this', this), 'drawPoint', false)($7.R(2585, 'place', place), $7.R(2589, 'color', color));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11153))
                                                        continue jalangiLabel9;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    drawPoint: $7.T(2761, function (place, color) {
                                        jalangiLabel10:
                                            while (true) {
                                                try {
                                                    $7.Fe(2745, arguments.callee, this);
                                                    $7.N(2749, 'arguments', arguments, true);
                                                    $7.N(2753, 'place', place, true);
                                                    $7.N(2757, 'color', color, true);
                                                    $7.M(2681, $7.M(2673, $7.F(2649, $7.I(typeof $ === 'undefined' ? $7.R(2617, '$', undefined) : $7.R(2617, '$', $)), false)($7.B(234, '+', $7.B(230, '+', $7.T(2621, 'img#a', 21), $7.G(2633, $7.R(2625, 'place', place), $7.T(2629, 0, 22))), $7.G(2645, $7.R(2637, 'place', place), $7.T(2641, 1, 22)))), 'attr', false)($7.T(2653, 'src', 21), $7.G(2669, $7.G(2661, $7.R(2657, 'this', this), 'boardTexture'), $7.R(2665, 'color', color))), 'removeClass', false)($7.T(2677, 'tip', 21));
                                                    $7.M(2741, $7.M(2729, $7.F(2717, $7.I(typeof $ === 'undefined' ? $7.R(2685, '$', undefined) : $7.R(2685, '$', $)), false)($7.B(242, '+', $7.B(238, '+', $7.T(2689, 'a#l', 21), $7.G(2701, $7.R(2693, 'place', place), $7.T(2697, 0, 22))), $7.G(2713, $7.R(2705, 'place', place), $7.T(2709, 1, 22)))), 'attr', false)($7.T(2721, 'onMouseOver', 21), $7.T(2725, '', 21)), 'attr', false)($7.T(2733, 'onMouseOut', 21), $7.T(2737, '', 21));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11157))
                                                        continue jalangiLabel10;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    drawPath: $7.T(3005, function (path, color) {
                                        jalangiLabel11:
                                            while (true) {
                                                try {
                                                    $7.Fe(2981, arguments.callee, this);
                                                    $7.N(2985, 'arguments', arguments, true);
                                                    $7.N(2989, 'path', path, true);
                                                    $7.N(2993, 'color', color, true);
                                                    $7.N(2997, 'n', n, false);
                                                    $7.N(3001, 'str', str, false);
                                                    $7.P(2773, $7.R(2765, 'this', this), 'isDrawing', $7.T(2769, true, 23));
                                                    for (var n = $7.W(2781, 'n', $7.T(2777, 0, 22), n); $7.C(80, $7.B(246, '<', $7.R(2785, 'n', n), $7.G(2793, $7.R(2789, 'path', path), 'length'))); $7.B(254, '-', n = $7.W(2801, 'n', $7.B(250, '+', $7.R(2797, 'n', n), 1), n), 1)) {
                                                        $7.P(2861, $7.G(2833, $7.G(2809, $7.R(2805, 'this', this), 'board'), $7.G(2829, $7.G(2821, $7.R(2813, 'path', path), $7.R(2817, 'n', n)), $7.T(2825, 0, 22))), $7.G(2853, $7.G(2845, $7.R(2837, 'path', path), $7.R(2841, 'n', n)), $7.T(2849, 1, 22)), $7.R(2857, 'color', color));
                                                        var str = $7.W(2925, 'str', $7.B(278, '+', $7.B(274, '+', $7.B(270, '+', $7.B(266, '+', $7.B(262, '+', $7.B(258, '+', $7.T(2865, 'World.drawPoint([', 21), $7.G(2885, $7.G(2877, $7.R(2869, 'path', path), $7.R(2873, 'n', n)), $7.T(2881, 0, 22))), $7.T(2889, ',', 21)), $7.G(2909, $7.G(2901, $7.R(2893, 'path', path), $7.R(2897, 'n', n)), $7.T(2905, 1, 22))), $7.T(2913, '],\'', 21)), $7.R(2917, 'color', color)), $7.T(2921, '\')', 21)), str);
                                                        $7.F(2949, $7.I(typeof setTimeout === 'undefined' ? $7.R(2929, 'setTimeout', undefined) : $7.R(2929, 'setTimeout', setTimeout)), false)($7.R(2933, 'str', str), $7.B(286, '*', $7.T(2937, 100, 22), $7.B(282, '+', $7.R(2941, 'n', n), $7.T(2945, 1, 22))));
                                                    }
                                                    $7.F(2977, $7.I(typeof setTimeout === 'undefined' ? $7.R(2953, 'setTimeout', undefined) : $7.R(2953, 'setTimeout', setTimeout)), false)($7.T(2957, 'World.drawMessage()', 21), $7.B(294, '*', $7.T(2961, 100, 22), $7.B(290, '+', $7.G(2969, $7.R(2965, 'path', path), 'length'), $7.T(2973, 1, 22))));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11161))
                                                        continue jalangiLabel11;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    setBorder: $7.T(3241, function (place) {
                                        jalangiLabel12:
                                            while (true) {
                                                try {
                                                    $7.Fe(3229, arguments.callee, this);
                                                    $7.N(3233, 'arguments', arguments, true);
                                                    $7.N(3237, 'place', place, true);
                                                    if ($7.C(84, $7.B(298, '>', $7.G(3017, $7.G(3013, $7.R(3009, 'this', this), 'point'), 'length'), $7.T(3021, 0, 22)))) {
                                                        $7.M(3073, $7.F(3065, $7.I(typeof $ === 'undefined' ? $7.R(3025, '$', undefined) : $7.R(3025, '$', $)), false)($7.B(306, '+', $7.B(302, '+', $7.T(3029, 'img#a', 21), $7.G(3045, $7.G(3037, $7.R(3033, 'this', this), 'point'), $7.T(3041, 0, 22))), $7.G(3061, $7.G(3053, $7.R(3049, 'this', this), 'point'), $7.T(3057, 1, 22)))), 'removeClass', false)($7.T(3069, 'img_board_select', 21));
                                                        $7.M(3125, $7.F(3117, $7.I(typeof $ === 'undefined' ? $7.R(3077, '$', undefined) : $7.R(3077, '$', $)), false)($7.B(314, '+', $7.B(310, '+', $7.T(3081, 'img#a', 21), $7.G(3097, $7.G(3089, $7.R(3085, 'this', this), 'point'), $7.T(3093, 0, 22))), $7.G(3113, $7.G(3105, $7.R(3101, 'this', this), 'point'), $7.T(3109, 1, 22)))), 'addClass', false)($7.T(3121, 'img_board', 21));
                                                    }
                                                    $7.M(3169, $7.F(3161, $7.I(typeof $ === 'undefined' ? $7.R(3129, '$', undefined) : $7.R(3129, '$', $)), false)($7.B(322, '+', $7.B(318, '+', $7.T(3133, 'img#a', 21), $7.G(3145, $7.R(3137, 'place', place), $7.T(3141, 0, 22))), $7.G(3157, $7.R(3149, 'place', place), $7.T(3153, 1, 22)))), 'removeClass', false)($7.T(3165, 'img_board', 21));
                                                    $7.M(3213, $7.F(3205, $7.I(typeof $ === 'undefined' ? $7.R(3173, '$', undefined) : $7.R(3173, '$', $)), false)($7.B(330, '+', $7.B(326, '+', $7.T(3177, 'img#a', 21), $7.G(3189, $7.R(3181, 'place', place), $7.T(3185, 0, 22))), $7.G(3201, $7.R(3193, 'place', place), $7.T(3197, 1, 22)))), 'addClass', false)($7.T(3209, 'img_board_select', 21));
                                                    $7.P(3225, $7.R(3217, 'this', this), 'point', $7.R(3221, 'place', place));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11165))
                                                        continue jalangiLabel12;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    drawMessage: $7.T(4305, function () {
                                        jalangiLabel13:
                                            while (true) {
                                                try {
                                                    $7.Fe(4257, arguments.callee, this);
                                                    $7.N(4261, 'arguments', arguments, true);
                                                    $7.N(4265, 'bc', bc, false);
                                                    $7.N(4269, 'wc', wc, false);
                                                    $7.N(4273, 'count', count, false);
                                                    $7.N(4277, 'i', i, false);
                                                    $7.N(4281, 'j', j, false);
                                                    $7.N(4285, 'bpossible', bpossible, false);
                                                    $7.N(4289, 'wpossible', wpossible, false);
                                                    $7.N(4293, 'tpossible', tpossible, false);
                                                    $7.N(4297, 'p', p, false);
                                                    $7.N(4301, 'w', w, false);
                                                    var bc = $7.W(3249, 'bc', $7.T(3245, 0, 22), bc);
                                                    var wc = $7.W(3257, 'wc', $7.T(3253, 0, 22), wc);
                                                    if ($7.C(96, $7.B(338, '!=', $7.U(334, 'typeof', $7.G(3273, $7.G(3265, $7.R(3261, 'this', this), 'heap'), $7.T(3269, 'value', 21))), $7.T(3277, 'undefined', 21)))) {
                                                        bc = $7.W(3305, 'bc', $7.F(3301, $7.I(typeof parseInt === 'undefined' ? $7.R(3281, 'parseInt', undefined) : $7.R(3281, 'parseInt', parseInt)), false)($7.G(3297, $7.G(3289, $7.R(3285, 'this', this), 'heap'), $7.T(3293, 'black', 21))), bc);
                                                        wc = $7.W(3333, 'wc', $7.F(3329, $7.I(typeof parseInt === 'undefined' ? $7.R(3309, 'parseInt', undefined) : $7.R(3309, 'parseInt', parseInt)), false)($7.G(3325, $7.G(3317, $7.R(3313, 'this', this), 'heap'), $7.T(3321, 'white', 21))), wc);
                                                    } else {
                                                        var count = $7.W(3349, 'count', $7.T(3345, {
                                                                black: $7.T(3337, 0, 22),
                                                                white: $7.T(3341, 0, 22)
                                                            }, 11), count);
                                                        for (var i = $7.W(3357, 'i', $7.T(3353, 0, 22), i); $7.C(92, $7.B(342, '<', $7.R(3361, 'i', i), $7.G(3369, $7.R(3365, 'this', this), 'bounder'))); $7.B(350, '-', i = $7.W(3377, 'i', $7.B(346, '+', $7.R(3373, 'i', i), 1), i), 1)) {
                                                            for (var j = $7.W(3385, 'j', $7.T(3381, 0, 22), j); $7.C(88, $7.B(354, '<', $7.R(3389, 'j', j), $7.G(3397, $7.R(3393, 'this', this), 'bounder'))); $7.B(362, '-', j = $7.W(3405, 'j', $7.B(358, '+', $7.R(3401, 'j', j), 1), j), 1)) {
                                                                $7.A(3449, $7.R(3409, 'count', count), $7.G(3433, $7.G(3425, $7.G(3417, $7.R(3413, 'this', this), 'board'), $7.R(3421, 'i', i)), $7.R(3429, 'j', j)), '+')($7.F(3445, $7.I(typeof parseInt === 'undefined' ? $7.R(3437, 'parseInt', undefined) : $7.R(3437, 'parseInt', parseInt)), false)($7.T(3441, 1, 22)));
                                                            }
                                                        }
                                                        bc = $7.W(3465, 'bc', $7.G(3461, $7.R(3453, 'count', count), $7.T(3457, 'black', 21)), bc);
                                                        wc = $7.W(3481, 'wc', $7.G(3477, $7.R(3469, 'count', count), $7.T(3473, 'white', 21)), wc);
                                                    }
                                                    $7.M(3509, $7.F(3501, $7.I(typeof $ === 'undefined' ? $7.R(3485, '$', undefined) : $7.R(3485, '$', $)), false)($7.B(366, '+', $7.T(3489, '#', 21), $7.G(3497, $7.R(3493, 'this', this), 'blackResultView'))), 'html', false)($7.R(3505, 'bc', bc));
                                                    $7.M(3537, $7.F(3529, $7.I(typeof $ === 'undefined' ? $7.R(3513, '$', undefined) : $7.R(3513, '$', $)), false)($7.B(370, '+', $7.T(3517, '#', 21), $7.G(3525, $7.R(3521, 'this', this), 'whiteResultView'))), 'html', false)($7.R(3533, 'wc', wc));
                                                    var bpossible;
                                                    var wpossible;
                                                    if ($7.C(108, $7.C(100, $7.B(378, '!=', $7.U(374, 'typeof', $7.G(3553, $7.G(3545, $7.R(3541, 'this', this), 'heap'), $7.T(3549, 'value', 21))), $7.T(3557, 'undefined', 21))) ? $7.B(382, '==', $7.G(3573, $7.G(3565, $7.R(3561, 'this', this), 'heap'), $7.T(3569, 'color', 21)), $7.G(3581, $7.R(3577, 'this', this), 'currentColor')) : $7._())) {
                                                        if ($7.C(104, $7.B(386, '==', $7.G(3597, $7.G(3589, $7.R(3585, 'this', this), 'heap'), $7.T(3593, 'color', 21)), $7.T(3601, 'white', 21)))) {
                                                            bpossible = $7.W(3621, 'bpossible', $7.G(3617, $7.G(3609, $7.R(3605, 'this', this), 'heap'), $7.T(3613, 'upossible', 21)), bpossible);
                                                            wpossible = $7.W(3641, 'wpossible', $7.G(3637, $7.G(3629, $7.R(3625, 'this', this), 'heap'), $7.T(3633, 'cpossible', 21)), wpossible);
                                                        } else {
                                                            wpossible = $7.W(3661, 'wpossible', $7.G(3657, $7.G(3649, $7.R(3645, 'this', this), 'heap'), $7.T(3653, 'upossible', 21)), wpossible);
                                                            bpossible = $7.W(3681, 'bpossible', $7.G(3677, $7.G(3669, $7.R(3665, 'this', this), 'heap'), $7.T(3673, 'cpossible', 21)), bpossible);
                                                        }
                                                    } else {
                                                        wpossible = $7.W(3697, 'wpossible', $7.M(3693, $7.R(3685, 'this', this), 'possiblePlace', false)($7.T(3689, 'white', 21)), wpossible);
                                                        bpossible = $7.W(3713, 'bpossible', $7.M(3709, $7.R(3701, 'this', this), 'possiblePlace', false)($7.T(3705, 'black', 21)), bpossible);
                                                    }
                                                    $7.P(3757, $7.R(3717, 'this', this), 'isEnd', $7.C(116, $7.C(112, $7.B(390, '==', $7.G(3725, $7.R(3721, 'bpossible', bpossible), 'length'), $7.T(3729, 0, 22))) ? $7.B(394, '==', $7.G(3737, $7.R(3733, 'wpossible', wpossible), 'length'), $7.T(3741, 0, 22)) : $7._()) ? $7._() : $7.B(398, '==', $7.G(3749, $7.R(3745, 'this', this), 'step'), $7.T(3753, 64, 22)));
                                                    if ($7.C(152, $7.U(402, '!', $7.G(3765, $7.R(3761, 'this', this), 'isEnd')))) {
                                                        var tpossible = $7.W(3773, 'tpossible', $7.R(3769, 'bpossible', bpossible), tpossible);
                                                        if ($7.C(128, $7.B(406, '==', $7.G(3781, $7.R(3777, 'this', this), 'currentColor'), $7.T(3785, 'black', 21)))) {
                                                            if ($7.C(120, $7.B(410, '>', $7.G(3793, $7.R(3789, 'wpossible', wpossible), 'length'), $7.T(3797, 0, 22)))) {
                                                                $7.P(3809, $7.R(3801, 'this', this), 'currentColor', $7.T(3805, 'white', 21));
                                                                tpossible = $7.W(3817, 'tpossible', $7.R(3813, 'wpossible', wpossible), tpossible);
                                                            }
                                                        } else {
                                                            if ($7.C(124, $7.B(414, '>', $7.G(3825, $7.R(3821, 'bpossible', bpossible), 'length'), $7.T(3829, 0, 22)))) {
                                                                $7.P(3841, $7.R(3833, 'this', this), 'currentColor', $7.T(3837, 'black', 21));
                                                            } else {
                                                                tpossilbe = $7.W(3849, 'tpossilbe', $7.R(3845, 'wpossible', wpossible), $7.I(typeof tpossilbe === 'undefined' ? undefined : tpossilbe));
                                                            }
                                                        }
                                                        $7.M(3897, $7.F(3869, $7.I(typeof $ === 'undefined' ? $7.R(3853, '$', undefined) : $7.R(3853, '$', $)), false)($7.B(418, '+', $7.T(3857, '#', 21), $7.G(3865, $7.R(3861, 'this', this), 'messageview'))), 'attr', false)($7.T(3873, 'src', 21), $7.G(3893, $7.G(3881, $7.R(3877, 'this', this), 'boardTexture'), $7.G(3889, $7.R(3885, 'this', this), 'currentColor')));
                                                        $7.P(3909, $7.R(3901, 'this', this), 'possible', $7.R(3905, 'tpossible', tpossible));
                                                        $7.M(3925, $7.R(3913, 'this', this), 'setTips', false)($7.G(3921, $7.R(3917, 'this', this), 'currentColor'));
                                                        if ($7.C(136, $7.C(132, $7.B(422, '==', $7.G(3933, $7.R(3929, 'this', this), 'playerNum'), $7.T(3937, 1, 22))) ? $7.B(426, '==', $7.G(3945, $7.R(3941, 'this', this), 'currentColor'), $7.T(3949, 'white', 21)) : $7._())) {
                                                            $7.P(3961, $7.R(3953, 'this', this), 'isUserTurn', $7.T(3957, false, 23));
                                                            $7.M(3969, $7.R(3965, 'this', this), 'computerTurn', false)();
                                                        } else {
                                                            $7.P(3981, $7.R(3973, 'this', this), 'isUserTurn', $7.T(3977, true, 23));
                                                        }
                                                    } else {
                                                        var p = $7.W(4001, 'p', $7.F(3997, $7.R(3985, 'getMessage', getMessage), false)($7.T(3989, 'player', 21), $7.T(3993, 'player', 21)), p);
                                                        var w = $7.W(4021, 'w', $7.F(4017, $7.R(4005, 'getMessage', getMessage), false)($7.T(4009, 'win', 21), $7.T(4013, 'Wins', 21)), w);
                                                        if ($7.C(148, $7.B(430, '>', $7.R(4025, 'bc', bc), $7.R(4029, 'wc', wc)))) {
                                                            $7.M(4061, $7.F(4041, $7.I(typeof $ === 'undefined' ? $7.R(4033, '$', undefined) : $7.R(4033, '$', $)), false)($7.T(4037, '.result_win_text', 21)), 'html', false)($7.B(442, '+', $7.B(438, '+', $7.B(434, '+', $7.R(4045, 'p', p), $7.T(4049, ' 1 ', 21)), $7.R(4053, 'w', w)), $7.T(4057, '!', 21)));
                                                        } else if ($7.C(144, $7.B(446, '==', $7.R(4065, 'bc', bc), $7.R(4069, 'wc', wc)))) {
                                                            $7.M(4101, $7.F(4081, $7.I(typeof $ === 'undefined' ? $7.R(4073, '$', undefined) : $7.R(4073, '$', $)), false)($7.T(4077, '.result_win_text', 21)), 'html', false)($7.F(4097, $7.R(4085, 'getMessage', getMessage), false)($7.T(4089, 'winDraw', 21), $7.T(4093, 'Draw!', 21)));
                                                        } else {
                                                            if ($7.C(140, $7.B(450, '==', $7.G(4109, $7.R(4105, 'this', this), 'playerNum'), $7.T(4113, 2, 22)))) {
                                                                $7.M(4145, $7.F(4125, $7.I(typeof $ === 'undefined' ? $7.R(4117, '$', undefined) : $7.R(4117, '$', $)), false)($7.T(4121, '.result_win_text', 21)), 'html', false)($7.B(462, '+', $7.B(458, '+', $7.B(454, '+', $7.R(4129, 'p', p), $7.T(4133, ' 2 ', 21)), $7.R(4137, 'w', w)), $7.T(4141, '!', 21)));
                                                            } else {
                                                                $7.M(4177, $7.F(4157, $7.I(typeof $ === 'undefined' ? $7.R(4149, '$', undefined) : $7.R(4149, '$', $)), false)($7.T(4153, '.result_win_text', 21)), 'html', false)($7.F(4173, $7.R(4161, 'getMessage', getMessage), false)($7.T(4165, 'winComputer', 21), $7.T(4169, 'Computer Wins!', 21)));
                                                            }
                                                        }
                                                        $7.M(4189, $7.R(4181, 'this', this), 'playSound', false)($7.T(4185, 'snd_victoryhorns', 21));
                                                        $7.M(4217, $7.F(4209, $7.I(typeof $ === 'undefined' ? $7.R(4193, '$', undefined) : $7.R(4193, '$', $)), false)($7.B(466, '+', $7.T(4197, '#', 21), $7.G(4205, $7.R(4201, 'this', this), 'result'))), 'removeClass', false)($7.T(4213, 'display_none', 21));
                                                        $7.P(4229, $7.R(4221, 'this', this), 'isLock', $7.T(4225, true, 23));
                                                        $7.P(4241, $7.R(4233, 'this', this), 'isResult', $7.T(4237, true, 23));
                                                    }
                                                    $7.P(4253, $7.R(4245, 'this', this), 'isDrawing', $7.T(4249, false, 23));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11169))
                                                        continue jalangiLabel13;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    closeResult: $7.T(4357, function () {
                                        jalangiLabel14:
                                            while (true) {
                                                try {
                                                    $7.Fe(4349, arguments.callee, this);
                                                    $7.N(4353, 'arguments', arguments, true);
                                                    $7.M(4333, $7.F(4325, $7.I(typeof $ === 'undefined' ? $7.R(4309, '$', undefined) : $7.R(4309, '$', $)), false)($7.B(470, '+', $7.T(4313, '#', 21), $7.G(4321, $7.R(4317, 'this', this), 'result'))), 'addClass', false)($7.T(4329, 'display_none', 21));
                                                    $7.P(4345, $7.R(4337, 'this', this), 'isResult', $7.T(4341, false, 23));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11173))
                                                        continue jalangiLabel14;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    setTips: $7.T(4613, function (color) {
                                        jalangiLabel15:
                                            while (true) {
                                                try {
                                                    $7.Fe(4581, arguments.callee, this);
                                                    $7.N(4585, 'arguments', arguments, true);
                                                    $7.N(4589, 'color', color, true);
                                                    $7.N(4593, 'stone', stone, false);
                                                    $7.N(4597, 'spare', spare, false);
                                                    $7.N(4601, 'n', n, false);
                                                    $7.N(4605, 'p', p, false);
                                                    $7.N(4609, 'id', id, false);
                                                    var stone = $7.W(4377, 'stone', $7.G(4373, $7.G(4365, $7.R(4361, 'this', this), 'boardTexture'), $7.R(4369, 'color', color)), stone);
                                                    var spare = $7.W(4397, 'spare', $7.G(4393, $7.G(4385, $7.R(4381, 'this', this), 'boardTexture'), $7.T(4389, 'board', 21)), spare);
                                                    for (var n in $7.H(4577, $7.G(4405, $7.R(4401, 'this', this), 'possible'))) {
                                                        var p = $7.W(4425, 'p', $7.G(4421, $7.G(4413, $7.R(4409, 'this', this), 'possible'), $7.R(4417, 'n', n)), p);
                                                        if ($7.C(156, $7.B(474, '==', $7.G(4465, $7.G(4449, $7.G(4433, $7.R(4429, 'this', this), 'board'), $7.G(4445, $7.R(4437, 'p', p), $7.T(4441, 0, 22))), $7.G(4461, $7.R(4453, 'p', p), $7.T(4457, 1, 22))), $7.T(4469, 'board', 21)))) {
                                                            var id = $7.W(4501, 'id', $7.B(482, '+', $7.B(478, '+', $7.T(4473, 'l', 21), $7.G(4485, $7.R(4477, 'p', p), $7.T(4481, 0, 22))), $7.G(4497, $7.R(4489, 'p', p), $7.T(4493, 1, 22))), id);
                                                            $7.M(4573, $7.M(4545, $7.F(4517, $7.I(typeof $ === 'undefined' ? $7.R(4505, '$', undefined) : $7.R(4505, '$', $)), false)($7.B(486, '+', $7.T(4509, '#', 21), $7.R(4513, 'id', id))), 'attr', false)($7.T(4521, 'onMouseOver', 21), $7.B(502, '+', $7.B(498, '+', $7.B(494, '+', $7.B(490, '+', $7.T(4525, '$(\'#', 21), $7.R(4529, 'id', id)), $7.T(4533, ' img\').attr(\'src\',\'', 21)), $7.R(4537, 'stone', stone)), $7.T(4541, '\').addClass(\'tip\');', 21))), 'attr', false)($7.T(4549, 'onMouseOut', 21), $7.B(518, '+', $7.B(514, '+', $7.B(510, '+', $7.B(506, '+', $7.T(4553, '$(\'#', 21), $7.R(4557, 'id', id)), $7.T(4561, ' img\').attr(\'src\',\'', 21)), $7.R(4565, 'spare', spare)), $7.T(4569, '\').removeClass(\'tip\');', 21)));
                                                        }
                                                    }
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11177))
                                                        continue jalangiLabel15;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    clearTips: $7.T(4837, function () {
                                        jalangiLabel16:
                                            while (true) {
                                                try {
                                                    $7.Fe(4809, arguments.callee, this);
                                                    $7.N(4813, 'arguments', arguments, true);
                                                    $7.N(4817, 'possible', possible, false);
                                                    $7.N(4821, 'n', n, false);
                                                    $7.N(4825, 'p', p, false);
                                                    $7.N(4829, 'spare', spare, false);
                                                    $7.N(4833, 'id', id, false);
                                                    var possible = $7.W(4625, 'possible', $7.G(4621, $7.R(4617, 'this', this), 'possible'), possible);
                                                    for (var n in $7.H(4805, $7.R(4629, 'possible', possible))) {
                                                        var p = $7.W(4645, 'p', $7.G(4641, $7.R(4633, 'possible', possible), $7.R(4637, 'n', n)), p);
                                                        var spare = $7.W(4701, 'spare', $7.G(4697, $7.G(4653, $7.R(4649, 'this', this), 'boardTexture'), $7.G(4693, $7.G(4677, $7.G(4661, $7.R(4657, 'this', this), 'board'), $7.G(4673, $7.R(4665, 'p', p), $7.T(4669, 0, 22))), $7.G(4689, $7.R(4681, 'p', p), $7.T(4685, 1, 22)))), spare);
                                                        var id = $7.W(4733, 'id', $7.B(526, '+', $7.B(522, '+', $7.T(4705, 'l', 21), $7.G(4717, $7.R(4709, 'p', p), $7.T(4713, 0, 22))), $7.G(4729, $7.R(4721, 'p', p), $7.T(4725, 1, 22))), id);
                                                        $7.M(4801, $7.M(4793, $7.M(4781, $7.M(4773, $7.M(4761, $7.F(4749, $7.I(typeof $ === 'undefined' ? $7.R(4737, '$', undefined) : $7.R(4737, '$', $)), false)($7.B(530, '+', $7.T(4741, '#', 21), $7.R(4745, 'id', id))), 'attr', false)($7.T(4753, 'onMouseOver', 21), $7.T(4757, '', 21)), 'attr', false)($7.T(4765, 'onMouseOut', 21), $7.T(4769, '', 21)), 'find', false)($7.T(4777, 'img', 21)), 'attr', false)($7.T(4785, 'src', 21), $7.R(4789, 'spare', spare)), 'removeClass', false)($7.T(4797, 'tip', 21));
                                                    }
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11181))
                                                        continue jalangiLabel16;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    drawBoard: $7.T(5077, function () {
                                        jalangiLabel17:
                                            while (true) {
                                                try {
                                                    $7.Fe(5057, arguments.callee, this);
                                                    $7.N(5061, 'arguments', arguments, true);
                                                    $7.N(5065, 'str', str, false);
                                                    $7.N(5069, 'i', i, false);
                                                    $7.N(5073, 'j', j, false);
                                                    var str = $7.W(4845, 'str', $7.T(4841, '', 21), str);
                                                    for (var i = $7.W(4853, 'i', $7.T(4849, 0, 22), i); $7.C(164, $7.B(534, '<', $7.R(4857, 'i', i), $7.G(4865, $7.R(4861, 'this', this), 'bounder'))); $7.B(542, '-', i = $7.W(4873, 'i', $7.B(538, '+', $7.R(4869, 'i', i), 1), i), 1)) {
                                                        str = $7.W(4885, 'str', $7.B(546, '+', $7.R(4881, 'str', str), $7.T(4877, '<div>', 21)), str);
                                                        for (var j = $7.W(4893, 'j', $7.T(4889, 0, 22), j); $7.C(160, $7.B(550, '<', $7.R(4897, 'j', j), $7.G(4905, $7.R(4901, 'this', this), 'bounder'))); $7.B(558, '-', j = $7.W(4913, 'j', $7.B(554, '+', $7.R(4909, 'j', j), 1), j), 1)) {
                                                            str = $7.W(5005, 'str', $7.B(610, '+', $7.R(5001, 'str', str), $7.B(606, '+', $7.B(602, '+', $7.B(598, '+', $7.B(594, '+', $7.B(590, '+', $7.B(586, '+', $7.B(582, '+', $7.B(578, '+', $7.B(574, '+', $7.B(570, '+', $7.B(566, '+', $7.B(562, '+', $7.T(4917, '<span><a onClick="javascript:World.click(', 21), $7.R(4921, 'i', i)), $7.T(4925, ',', 21)), $7.R(4929, 'j', j)), $7.T(4933, ');" id="l', 21)), $7.R(4937, 'i', i)), $7.R(4941, 'j', j)), $7.T(4945, '" class="img_style" onMouseOver="" onMouseOut="" ><img src="', 21)), $7.G(4981, $7.G(4953, $7.R(4949, 'this', this), 'boardTexture'), $7.G(4977, $7.G(4969, $7.G(4961, $7.R(4957, 'this', this), 'board'), $7.R(4965, 'i', i)), $7.R(4973, 'j', j)))), $7.T(4985, '" id="a', 21)), $7.R(4989, 'i', i)), $7.R(4993, 'j', j)), $7.T(4997, '" class="img_board" /></a></span>', 21))), str);
                                                        }
                                                        str = $7.W(5017, 'str', $7.B(614, '+', $7.R(5013, 'str', str), $7.T(5009, '</div>', 21)), str);
                                                    }
                                                    $7.M(5045, $7.F(5037, $7.I(typeof $ === 'undefined' ? $7.R(5021, '$', undefined) : $7.R(5021, '$', $)), false)($7.B(618, '+', $7.T(5025, '#', 21), $7.G(5033, $7.R(5029, 'this', this), 'boardview'))), 'html', false)($7.R(5041, 'str', str));
                                                    $7.M(5053, $7.R(5049, 'this', this), 'drawMessage', false)();
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11185))
                                                        continue jalangiLabel17;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    click: $7.T(5337, function (i, j) {
                                        jalangiLabel18:
                                            while (true) {
                                                try {
                                                    $7.Fe(5321, arguments.callee, this);
                                                    $7.N(5325, 'arguments', arguments, true);
                                                    $7.N(5329, 'i', i, true);
                                                    $7.N(5333, 'j', j, true);
                                                    if ($7.C(232, $7.C(184, $7.C(180, $7.C(176, $7.C(172, $7.C(168, $7.B(622, '===', $7.G(5101, $7.G(5093, $7.G(5085, $7.R(5081, 'this', this), 'board'), $7.R(5089, 'i', i)), $7.R(5097, 'j', j)), $7.T(5105, 'board', 21))) ? $7.U(626, '!', $7.G(5113, $7.R(5109, 'this', this), 'isEnd')) : $7._()) ? $7.G(5121, $7.R(5117, 'this', this), 'isUserTurn') : $7._()) ? $7.U(630, '!', $7.G(5129, $7.R(5125, 'this', this), 'isDrawing')) : $7._()) ? $7.U(634, '!', $7.G(5137, $7.R(5133, 'this', this), 'isLock')) : $7._()) ? $7.U(638, '!', $7.G(5145, $7.R(5141, 'this', this), 'isConfigure')) : $7._())) {
                                                        if ($7.C(192, $7.M(5173, $7.R(5149, 'this', this), 'canRevert', false)($7.T(5161, [
                                                                $7.R(5153, 'i', i),
                                                                $7.R(5157, 'j', j)
                                                            ], 10), $7.G(5169, $7.R(5165, 'this', this), 'currentColor')))) {
                                                            $7.M(5201, $7.R(5177, 'this', this), 'actionAtPoint', false)($7.T(5189, [
                                                                $7.R(5181, 'i', i),
                                                                $7.R(5185, 'j', j)
                                                            ], 10), $7.G(5197, $7.R(5193, 'this', this), 'currentColor'));
                                                            if ($7.C(188, $7.B(642, '==', $7.G(5209, $7.R(5205, 'this', this), 'playerNum'), $7.T(5213, 1, 22))))
                                                                $7.P(5225, $7.R(5217, 'this', this), 'isUserTurn', $7.T(5221, false, 23));
                                                        } else {
                                                            $7.M(5237, $7.R(5229, 'this', this), 'playSound', false)($7.T(5233, 'snd_hint', 21));
                                                        }
                                                    } else if ($7.C(228, $7.C(224, $7.C(204, $7.C(200, $7.C(196, $7.G(5245, $7.R(5241, 'this', this), 'isConfigure')) ? $7.U(646, '!', $7.G(5253, $7.R(5249, 'this', this), 'isEnd')) : $7._()) ? $7.U(650, '!', $7.G(5261, $7.R(5257, 'this', this), 'isDrawing')) : $7._()) ? $7.U(654, '!', $7.G(5269, $7.R(5265, 'this', this), 'isLock')) : $7._()) ? $7._() : $7.C(220, $7.C(216, $7.C(212, $7.C(208, $7.G(5277, $7.R(5273, 'this', this), 'isConfigure')) ? $7.G(5285, $7.R(5281, 'this', this), 'isEnd') : $7._()) ? $7.U(658, '!', $7.G(5293, $7.R(5289, 'this', this), 'isDrawing')) : $7._()) ? $7.G(5301, $7.R(5297, 'this', this), 'isLock') : $7._()) ? $7.U(662, '!', $7.G(5309, $7.R(5305, 'this', this), 'isResult')) : $7._())) {
                                                        $7.M(5317, $7.R(5313, 'this', this), 'endConfigure', false)();
                                                    }
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11189))
                                                        continue jalangiLabel18;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    computerTurn: $7.T(5537, function () {
                                        jalangiLabel19:
                                            while (true) {
                                                try {
                                                    $7.Fe(5521, arguments.callee, this);
                                                    $7.N(5525, 'arguments', arguments, true);
                                                    $7.N(5529, 'possible', possible, false);
                                                    $7.N(5533, 'place', place, false);
                                                    if ($7.C(236, $7.G(5345, $7.R(5341, 'this', this), 'isDrawing'))) {
                                                        $7.F(5361, $7.I(typeof setTimeout === 'undefined' ? $7.R(5349, 'setTimeout', undefined) : $7.R(5349, 'setTimeout', setTimeout)), false)($7.T(5353, 'World.computerTurn()', 21), $7.T(5357, 500, 22));
                                                        return $7.Rt(5365, undefined);
                                                    }
                                                    var possible;
                                                    if ($7.C(244, $7.B(670, '!=', $7.U(666, 'typeof', $7.G(5381, $7.G(5373, $7.R(5369, 'this', this), 'heap'), $7.T(5377, 'value', 21))), $7.T(5385, 'undefined', 21)))) {
                                                        if ($7.C(240, $7.B(674, '==', $7.G(5401, $7.G(5393, $7.R(5389, 'this', this), 'heap'), $7.T(5397, 'color', 21)), $7.T(5405, 'white', 21)))) {
                                                            possible = $7.W(5425, 'possible', $7.G(5421, $7.G(5413, $7.R(5409, 'this', this), 'heap'), $7.T(5417, 'cpossible', 21)), possible);
                                                        } else {
                                                            possible = $7.W(5445, 'possible', $7.G(5441, $7.G(5433, $7.R(5429, 'this', this), 'heap'), $7.T(5437, 'upossible', 21)), possible);
                                                        }
                                                    } else {
                                                        possible = $7.W(5461, 'possible', $7.M(5457, $7.R(5449, 'this', this), 'possiblePlace', false)($7.T(5453, 'white', 21)), possible);
                                                    }
                                                    var place = $7.W(5477, 'place', $7.M(5473, $7.R(5465, 'this', this), 'bestPlace', false)($7.R(5469, 'possible', possible)), place);
                                                    if ($7.C(252, $7.C(248, $7.B(678, '>', $7.G(5485, $7.R(5481, 'possible', possible), 'length'), $7.T(5489, 0, 22))) ? $7.B(682, '>', $7.G(5497, $7.R(5493, 'place', place), 'length'), $7.T(5501, 0, 22)) : $7._())) {
                                                        $7.M(5517, $7.R(5505, 'this', this), 'actionAtPoint', false)($7.R(5509, 'place', place), $7.T(5513, 'white', 21));
                                                    }
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11193))
                                                        continue jalangiLabel19;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    isContain: $7.T(5665, function (place, _array) {
                                        jalangiLabel20:
                                            while (true) {
                                                try {
                                                    $7.Fe(5641, arguments.callee, this);
                                                    $7.N(5645, 'arguments', arguments, true);
                                                    $7.N(5649, 'place', place, true);
                                                    $7.N(5653, '_array', _array, true);
                                                    $7.N(5657, 'heat', heat, false);
                                                    $7.N(5661, 'i', i, false);
                                                    var heat = $7.W(5549, 'heat', $7.C(256, $7.R(5541, '_array', _array)) ? $7._() : $7.T(5545, [], 10), heat);
                                                    for (var i in $7.H(5629, $7.R(5553, 'heat', heat))) {
                                                        if ($7.C(264, $7.C(260, $7.B(686, '==', $7.G(5573, $7.G(5565, $7.R(5557, 'heat', heat), $7.R(5561, 'i', i)), $7.T(5569, 0, 22)), $7.G(5585, $7.R(5577, 'place', place), $7.T(5581, 0, 22)))) ? $7.B(690, '==', $7.G(5605, $7.G(5597, $7.R(5589, 'heat', heat), $7.R(5593, 'i', i)), $7.T(5601, 1, 22)), $7.G(5617, $7.R(5609, 'place', place), $7.T(5613, 1, 22))) : $7._())) {
                                                            return $7.Rt(5625, $7.T(5621, true, 23));
                                                        }
                                                    }
                                                    return $7.Rt(5637, $7.T(5633, false, 23));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11197))
                                                        continue jalangiLabel20;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    possiblePlace: $7.T(6105, function (color, _board) {
                                        jalangiLabel21:
                                            while (true) {
                                                try {
                                                    $7.Fe(6053, arguments.callee, this);
                                                    $7.N(6057, 'arguments', arguments, true);
                                                    $7.N(6061, 'color', color, true);
                                                    $7.N(6065, '_board', _board, true);
                                                    $7.N(6069, 'ret', ret, false);
                                                    $7.N(6073, 'tmp', tmp, false);
                                                    $7.N(6077, 'revColor', revColor, false);
                                                    $7.N(6081, 'board', board, false);
                                                    $7.N(6085, 'i', i, false);
                                                    $7.N(6089, 'j', j, false);
                                                    $7.N(6093, 'n', n, false);
                                                    $7.N(6097, 'ni', ni, false);
                                                    $7.N(6101, 'nj', nj, false);
                                                    var ret = $7.W(5673, 'ret', $7.T(5669, [], 10), ret);
                                                    var tmp = $7.W(5681, 'tmp', $7.T(5677, {}, 11), tmp);
                                                    var revColor = $7.W(5701, 'revColor', $7.C(268, $7.B(694, '==', $7.R(5685, 'color', color), $7.T(5689, 'white', 21))) ? $7.T(5693, 'black', 21) : $7.T(5697, 'white', 21), revColor);
                                                    var board = $7.W(5717, 'board', $7.C(272, $7.R(5705, '_board', _board)) ? $7._() : $7.G(5713, $7.R(5709, 'this', this), 'board'), board);
                                                    for (var i = $7.W(5725, 'i', $7.T(5721, 0, 22), i); $7.C(312, $7.B(698, '<', $7.R(5729, 'i', i), $7.G(5737, $7.R(5733, 'this', this), 'bounder'))); $7.B(706, '-', i = $7.W(5745, 'i', $7.B(702, '+', $7.R(5741, 'i', i), 1), i), 1)) {
                                                        for (var j = $7.W(5753, 'j', $7.T(5749, 0, 22), j); $7.C(308, $7.B(710, '<', $7.R(5757, 'j', j), $7.G(5765, $7.R(5761, 'this', this), 'bounder'))); $7.B(718, '-', j = $7.W(5773, 'j', $7.B(714, '+', $7.R(5769, 'j', j), 1), j), 1)) {
                                                            if ($7.C(304, $7.B(722, '===', $7.G(5793, $7.G(5785, $7.R(5777, 'board', board), $7.R(5781, 'i', i)), $7.R(5789, 'j', j)), $7.R(5797, 'revColor', revColor)))) {
                                                                for (var n in $7.H(6041, $7.G(5805, $7.R(5801, 'this', this), 'directs'))) {
                                                                    var ni = $7.W(5845, 'ni', $7.B(726, '+', $7.R(5809, 'i', i), $7.F(5841, $7.I(typeof parseInt === 'undefined' ? $7.R(5813, 'parseInt', undefined) : $7.R(5813, 'parseInt', parseInt)), false)($7.G(5837, $7.G(5829, $7.G(5821, $7.R(5817, 'this', this), 'directs'), $7.R(5825, 'n', n)), $7.T(5833, 0, 22)))), ni);
                                                                    var nj = $7.W(5885, 'nj', $7.B(730, '+', $7.R(5849, 'j', j), $7.F(5881, $7.I(typeof parseInt === 'undefined' ? $7.R(5853, 'parseInt', undefined) : $7.R(5853, 'parseInt', parseInt)), false)($7.G(5877, $7.G(5869, $7.G(5861, $7.R(5857, 'this', this), 'directs'), $7.R(5865, 'n', n)), $7.T(5873, 1, 22)))), nj);
                                                                    if ($7.C(300, $7.C(288, $7.C(284, $7.C(280, $7.C(276, $7.B(734, '>=', $7.R(5889, 'ni', ni), $7.T(5893, 0, 22))) ? $7.B(738, '<', $7.R(5897, 'ni', ni), $7.G(5905, $7.R(5901, 'this', this), 'bounder')) : $7._()) ? $7.B(742, '>=', $7.R(5909, 'nj', nj), $7.T(5913, 0, 22)) : $7._()) ? $7.B(746, '<', $7.R(5917, 'nj', nj), $7.G(5925, $7.R(5921, 'this', this), 'bounder')) : $7._()) ? $7.B(750, '===', $7.G(5945, $7.G(5937, $7.R(5929, 'board', board), $7.R(5933, 'ni', ni)), $7.R(5941, 'nj', nj)), $7.T(5949, 'board', 21)) : $7._())) {
                                                                        if ($7.C(296, $7.C(292, $7.M(5977, $7.R(5953, 'this', this), 'canRevert', false)($7.T(5965, [
                                                                                $7.R(5957, 'ni', ni),
                                                                                $7.R(5961, 'nj', nj)
                                                                            ], 10), $7.R(5969, 'color', color), $7.R(5973, 'board', board))) ? $7.U(754, '!', $7.M(6001, $7.R(5981, 'this', this), 'isContain', false)($7.T(5993, [
                                                                                $7.R(5985, 'ni', ni),
                                                                                $7.R(5989, 'nj', nj)
                                                                            ], 10), $7.R(5997, 'ret', ret))) : $7._())) {
                                                                            $7.M(6037, $7.R(6005, 'ret', ret), 'push', false)($7.T(6033, [
                                                                                $7.F(6017, $7.I(typeof parseInt === 'undefined' ? $7.R(6009, 'parseInt', undefined) : $7.R(6009, 'parseInt', parseInt)), false)($7.R(6013, 'ni', ni)),
                                                                                $7.F(6029, $7.I(typeof parseInt === 'undefined' ? $7.R(6021, 'parseInt', undefined) : $7.R(6021, 'parseInt', parseInt)), false)($7.R(6025, 'nj', nj))
                                                                            ], 10));
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    return $7.Rt(6049, $7.R(6045, 'ret', ret));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11201))
                                                        continue jalangiLabel21;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    canRevert: $7.T(6525, function (place, color, _board) {
                                        jalangiLabel22:
                                            while (true) {
                                                try {
                                                    $7.Fe(6469, arguments.callee, this);
                                                    $7.N(6473, 'arguments', arguments, true);
                                                    $7.N(6477, 'place', place, true);
                                                    $7.N(6481, 'color', color, true);
                                                    $7.N(6485, '_board', _board, true);
                                                    $7.N(6489, 'i', i, false);
                                                    $7.N(6493, 'j', j, false);
                                                    $7.N(6497, 'revColor', revColor, false);
                                                    $7.N(6501, 'board', board, false);
                                                    $7.N(6505, 'n', n, false);
                                                    $7.N(6509, 'di', di, false);
                                                    $7.N(6513, 'dj', dj, false);
                                                    $7.N(6517, 'ni', ni, false);
                                                    $7.N(6521, 'nj', nj, false);
                                                    var i = $7.W(6129, 'i', $7.F(6125, $7.I(typeof parseInt === 'undefined' ? $7.R(6109, 'parseInt', undefined) : $7.R(6109, 'parseInt', parseInt)), false)($7.G(6121, $7.R(6113, 'place', place), $7.T(6117, 0, 22))), i);
                                                    var j = $7.W(6153, 'j', $7.F(6149, $7.I(typeof parseInt === 'undefined' ? $7.R(6133, 'parseInt', undefined) : $7.R(6133, 'parseInt', parseInt)), false)($7.G(6145, $7.R(6137, 'place', place), $7.T(6141, 1, 22))), j);
                                                    var revColor = $7.W(6173, 'revColor', $7.C(316, $7.B(758, '==', $7.R(6157, 'color', color), $7.T(6161, 'white', 21))) ? $7.T(6165, 'black', 21) : $7.T(6169, 'white', 21), revColor);
                                                    var board = $7.W(6189, 'board', $7.C(320, $7.R(6177, '_board', _board)) ? $7._() : $7.G(6185, $7.R(6181, 'this', this), 'board'), board);
                                                    for (var n in $7.H(6457, $7.G(6197, $7.R(6193, 'this', this), 'directs'))) {
                                                        var di = $7.W(6233, 'di', $7.F(6229, $7.I(typeof parseInt === 'undefined' ? $7.R(6201, 'parseInt', undefined) : $7.R(6201, 'parseInt', parseInt)), false)($7.G(6225, $7.G(6217, $7.G(6209, $7.R(6205, 'this', this), 'directs'), $7.R(6213, 'n', n)), $7.T(6221, 0, 22))), di);
                                                        var dj = $7.W(6269, 'dj', $7.F(6265, $7.I(typeof parseInt === 'undefined' ? $7.R(6237, 'parseInt', undefined) : $7.R(6237, 'parseInt', parseInt)), false)($7.G(6261, $7.G(6253, $7.G(6245, $7.R(6241, 'this', this), 'directs'), $7.R(6249, 'n', n)), $7.T(6257, 1, 22))), dj);
                                                        var ni = $7.W(6281, 'ni', $7.B(762, '+', $7.R(6273, 'i', i), $7.R(6277, 'di', di)), ni);
                                                        var nj = $7.W(6293, 'nj', $7.B(766, '+', $7.R(6285, 'j', j), $7.R(6289, 'dj', dj)), nj);
                                                        while ($7.C(360, $7.C(336, $7.C(332, $7.C(328, $7.C(324, $7.B(770, '>=', $7.R(6297, 'ni', ni), $7.T(6301, 0, 22))) ? $7.B(774, '<', $7.R(6305, 'ni', ni), $7.G(6313, $7.R(6309, 'this', this), 'bounder')) : $7._()) ? $7.B(778, '>=', $7.R(6317, 'nj', nj), $7.T(6321, 0, 22)) : $7._()) ? $7.B(782, '<', $7.R(6325, 'nj', nj), $7.G(6333, $7.R(6329, 'this', this), 'bounder')) : $7._()) ? $7.B(786, '===', $7.G(6353, $7.G(6345, $7.R(6337, 'board', board), $7.R(6341, 'ni', ni)), $7.R(6349, 'nj', nj)), $7.R(6357, 'revColor', revColor)) : $7._())) {
                                                            ni = $7.W(6369, 'ni', $7.B(790, '+', $7.R(6365, 'ni', ni), $7.R(6361, 'di', di)), ni);
                                                            nj = $7.W(6381, 'nj', $7.B(794, '+', $7.R(6377, 'nj', nj), $7.R(6373, 'dj', dj)), nj);
                                                            if ($7.C(356, $7.C(352, $7.C(348, $7.C(344, $7.C(340, $7.B(798, '>=', $7.R(6385, 'ni', ni), $7.T(6389, 0, 22))) ? $7.B(802, '<', $7.R(6393, 'ni', ni), $7.G(6401, $7.R(6397, 'this', this), 'bounder')) : $7._()) ? $7.B(806, '>=', $7.R(6405, 'nj', nj), $7.T(6409, 0, 22)) : $7._()) ? $7.B(810, '<', $7.R(6413, 'nj', nj), $7.G(6421, $7.R(6417, 'this', this), 'bounder')) : $7._()) ? $7.B(814, '===', $7.G(6441, $7.G(6433, $7.R(6425, 'board', board), $7.R(6429, 'ni', ni)), $7.R(6437, 'nj', nj)), $7.R(6445, 'color', color)) : $7._())) {
                                                                return $7.Rt(6453, $7.T(6449, true, 23));
                                                            }
                                                        }
                                                    }
                                                    return $7.Rt(6465, $7.T(6461, false, 23));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11205))
                                                        continue jalangiLabel22;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    getClone: $7.T(6697, function (obj) {
                                        jalangiLabel23:
                                            while (true) {
                                                try {
                                                    $7.Fe(6673, arguments.callee, this);
                                                    $7.N(6677, 'arguments', arguments, true);
                                                    $7.N(6681, 'obj', obj, true);
                                                    $7.N(6685, 'ret', ret, false);
                                                    $7.N(6689, 'i', i, false);
                                                    $7.N(6693, 'j', j, false);
                                                    var ret = $7.W(6565, 'ret', $7.T(6561, [
                                                            $7.T(6529, [], 10),
                                                            $7.T(6533, [], 10),
                                                            $7.T(6537, [], 10),
                                                            $7.T(6541, [], 10),
                                                            $7.T(6545, [], 10),
                                                            $7.T(6549, [], 10),
                                                            $7.T(6553, [], 10),
                                                            $7.T(6557, [], 10)
                                                        ], 10), ret);
                                                    for (var i = $7.W(6573, 'i', $7.T(6569, 0, 22), i); $7.C(368, $7.B(818, '<', $7.R(6577, 'i', i), $7.G(6585, $7.R(6581, 'this', this), 'bounder'))); $7.B(826, '-', i = $7.W(6593, 'i', $7.B(822, '+', $7.R(6589, 'i', i), 1), i), 1)) {
                                                        for (var j = $7.W(6601, 'j', $7.T(6597, 0, 22), j); $7.C(364, $7.B(830, '<', $7.R(6605, 'j', j), $7.G(6613, $7.R(6609, 'this', this), 'bounder'))); $7.B(838, '-', j = $7.W(6621, 'j', $7.B(834, '+', $7.R(6617, 'j', j), 1), j), 1)) {
                                                            $7.P(6661, $7.G(6633, $7.R(6625, 'ret', ret), $7.R(6629, 'i', i)), $7.R(6637, 'j', j), $7.G(6657, $7.G(6649, $7.R(6641, 'obj', obj), $7.R(6645, 'i', i)), $7.R(6653, 'j', j)));
                                                        }
                                                    }
                                                    return $7.Rt(6669, $7.R(6665, 'ret', ret));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11209))
                                                        continue jalangiLabel23;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    getRevertPath: $7.T(7217, function (place, color, _board) {
                                        jalangiLabel24:
                                            while (true) {
                                                try {
                                                    $7.Fe(7161, arguments.callee, this);
                                                    $7.N(7165, 'arguments', arguments, true);
                                                    $7.N(7169, 'place', place, true);
                                                    $7.N(7173, 'color', color, true);
                                                    $7.N(7177, '_board', _board, true);
                                                    $7.N(7181, 'i', i, false);
                                                    $7.N(7185, 'j', j, false);
                                                    $7.N(7189, 'revColor', revColor, false);
                                                    $7.N(7193, 'board', board, false);
                                                    $7.N(7197, 'path', path, false);
                                                    $7.N(7201, 'n', n, false);
                                                    $7.N(7205, 'ni', ni, false);
                                                    $7.N(7209, 'nj', nj, false);
                                                    $7.N(7213, 'tpath', tpath, false);
                                                    var i = $7.W(6721, 'i', $7.F(6717, $7.I(typeof parseInt === 'undefined' ? $7.R(6701, 'parseInt', undefined) : $7.R(6701, 'parseInt', parseInt)), false)($7.G(6713, $7.R(6705, 'place', place), $7.T(6709, 0, 22))), i);
                                                    var j = $7.W(6745, 'j', $7.F(6741, $7.I(typeof parseInt === 'undefined' ? $7.R(6725, 'parseInt', undefined) : $7.R(6725, 'parseInt', parseInt)), false)($7.G(6737, $7.R(6729, 'place', place), $7.T(6733, 1, 22))), j);
                                                    var revColor = $7.W(6765, 'revColor', $7.C(372, $7.B(842, '==', $7.R(6749, 'color', color), $7.T(6753, 'white', 21))) ? $7.T(6757, 'black', 21) : $7.T(6761, 'white', 21), revColor);
                                                    var board = $7.W(6781, 'board', $7.C(376, $7.R(6769, '_board', _board)) ? $7._() : $7.G(6777, $7.R(6773, 'this', this), 'board'), board);
                                                    var path = $7.W(6789, 'path', $7.T(6785, [], 10), path);
                                                    for (var n in $7.H(7137, $7.G(6797, $7.R(6793, 'this', this), 'directs'))) {
                                                        var ni = $7.W(6837, 'ni', $7.B(846, '+', $7.R(6801, 'i', i), $7.F(6833, $7.I(typeof parseInt === 'undefined' ? $7.R(6805, 'parseInt', undefined) : $7.R(6805, 'parseInt', parseInt)), false)($7.G(6829, $7.G(6821, $7.G(6813, $7.R(6809, 'this', this), 'directs'), $7.R(6817, 'n', n)), $7.T(6825, 0, 22)))), ni);
                                                        var nj = $7.W(6877, 'nj', $7.B(850, '+', $7.R(6841, 'j', j), $7.F(6873, $7.I(typeof parseInt === 'undefined' ? $7.R(6845, 'parseInt', undefined) : $7.R(6845, 'parseInt', parseInt)), false)($7.G(6869, $7.G(6861, $7.G(6853, $7.R(6849, 'this', this), 'directs'), $7.R(6857, 'n', n)), $7.T(6865, 1, 22)))), nj);
                                                        var tpath = $7.W(6885, 'tpath', $7.T(6881, [], 10), tpath);
                                                        while ($7.C(416, $7.C(392, $7.C(388, $7.C(384, $7.C(380, $7.B(854, '>=', $7.R(6889, 'ni', ni), $7.T(6893, 0, 22))) ? $7.B(858, '<', $7.R(6897, 'ni', ni), $7.G(6905, $7.R(6901, 'this', this), 'bounder')) : $7._()) ? $7.B(862, '>=', $7.R(6909, 'nj', nj), $7.T(6913, 0, 22)) : $7._()) ? $7.B(866, '<', $7.R(6917, 'nj', nj), $7.G(6925, $7.R(6921, 'this', this), 'bounder')) : $7._()) ? $7.B(870, '===', $7.G(6945, $7.G(6937, $7.R(6929, 'board', board), $7.R(6933, 'ni', ni)), $7.R(6941, 'nj', nj)), $7.R(6949, 'revColor', revColor)) : $7._())) {
                                                            $7.M(6969, $7.R(6953, 'tpath', tpath), 'push', false)($7.T(6965, [
                                                                $7.R(6957, 'ni', ni),
                                                                $7.R(6961, 'nj', nj)
                                                            ], 10));
                                                            ni = $7.W(7009, 'ni', $7.B(874, '+', $7.R(7005, 'ni', ni), $7.F(7001, $7.I(typeof parseInt === 'undefined' ? $7.R(6973, 'parseInt', undefined) : $7.R(6973, 'parseInt', parseInt)), false)($7.G(6997, $7.G(6989, $7.G(6981, $7.R(6977, 'this', this), 'directs'), $7.R(6985, 'n', n)), $7.T(6993, 0, 22)))), ni);
                                                            nj = $7.W(7049, 'nj', $7.B(878, '+', $7.R(7045, 'nj', nj), $7.F(7041, $7.I(typeof parseInt === 'undefined' ? $7.R(7013, 'parseInt', undefined) : $7.R(7013, 'parseInt', parseInt)), false)($7.G(7037, $7.G(7029, $7.G(7021, $7.R(7017, 'this', this), 'directs'), $7.R(7025, 'n', n)), $7.T(7033, 1, 22)))), nj);
                                                            if ($7.C(412, $7.C(408, $7.C(404, $7.C(400, $7.C(396, $7.B(882, '>=', $7.R(7053, 'ni', ni), $7.T(7057, 0, 22))) ? $7.B(886, '<', $7.R(7061, 'ni', ni), $7.G(7069, $7.R(7065, 'this', this), 'bounder')) : $7._()) ? $7.B(890, '>=', $7.R(7073, 'nj', nj), $7.T(7077, 0, 22)) : $7._()) ? $7.B(894, '<', $7.R(7081, 'nj', nj), $7.G(7089, $7.R(7085, 'this', this), 'bounder')) : $7._()) ? $7.B(898, '===', $7.G(7109, $7.G(7101, $7.R(7093, 'board', board), $7.R(7097, 'ni', ni)), $7.R(7105, 'nj', nj)), $7.R(7113, 'color', color)) : $7._())) {
                                                                path = $7.W(7133, 'path', $7.M(7129, $7.I(typeof $ === 'undefined' ? $7.R(7117, '$', undefined) : $7.R(7117, '$', $)), 'merge', false)($7.R(7121, 'path', path), $7.R(7125, 'tpath', tpath)), path);
                                                            }
                                                        }
                                                    }
                                                    return $7.Rt(7157, $7.T(7153, {
                                                        place: $7.R(7141, 'place', place),
                                                        path: $7.R(7145, 'path', path),
                                                        color: $7.R(7149, 'color', color)
                                                    }, 11));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11213))
                                                        continue jalangiLabel24;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    doRevert: $7.T(7373, function (action, _board) {
                                        jalangiLabel25:
                                            while (true) {
                                                try {
                                                    $7.Fe(7341, arguments.callee, this);
                                                    $7.N(7345, 'arguments', arguments, true);
                                                    $7.N(7349, 'action', action, true);
                                                    $7.N(7353, '_board', _board, true);
                                                    $7.N(7357, 'color', color, false);
                                                    $7.N(7361, 'board', board, false);
                                                    $7.N(7365, 'path', path, false);
                                                    $7.N(7369, 'p', p, false);
                                                    var color = $7.W(7233, 'color', $7.G(7229, $7.R(7221, 'action', action), $7.T(7225, 'color', 21)), color);
                                                    var board = $7.W(7249, 'board', $7.C(420, $7.R(7237, '_board', _board)) ? $7._() : $7.G(7245, $7.R(7241, 'this', this), 'board'), board);
                                                    var path = $7.W(7265, 'path', $7.G(7261, $7.R(7253, 'action', action), $7.T(7257, 'path', 21)), path);
                                                    for (var p in $7.H(7329, $7.R(7269, 'path', path))) {
                                                        $7.P(7325, $7.G(7297, $7.R(7273, 'board', board), $7.G(7293, $7.G(7285, $7.R(7277, 'path', path), $7.R(7281, 'p', p)), $7.T(7289, 0, 22))), $7.G(7317, $7.G(7309, $7.R(7301, 'path', path), $7.R(7305, 'p', p)), $7.T(7313, 1, 22)), $7.R(7321, 'color', color));
                                                    }
                                                    return $7.Rt(7337, $7.R(7333, 'board', board));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11217))
                                                        continue jalangiLabel25;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    getValue: $7.T(7813, function (place, _board) {
                                        jalangiLabel26:
                                            while (true) {
                                                try {
                                                    $7.Fe(7777, arguments.callee, this);
                                                    $7.N(7781, 'arguments', arguments, true);
                                                    $7.N(7785, 'place', place, true);
                                                    $7.N(7789, '_board', _board, true);
                                                    $7.N(7793, 'ret', ret, false);
                                                    $7.N(7797, 'board', board, false);
                                                    $7.N(7801, 'i', i, false);
                                                    $7.N(7805, 'j', j, false);
                                                    $7.N(7809, 'mtable', mtable, false);
                                                    var ret = $7.W(7381, 'ret', $7.T(7377, 0, 22), ret);
                                                    var board = $7.W(7397, 'board', $7.C(424, $7.R(7385, '_board', _board)) ? $7._() : $7.G(7393, $7.R(7389, 'this', this), 'board'), board);
                                                    var i = $7.W(7421, 'i', $7.F(7417, $7.I(typeof parseInt === 'undefined' ? $7.R(7401, 'parseInt', undefined) : $7.R(7401, 'parseInt', parseInt)), false)($7.G(7413, $7.R(7405, 'place', place), $7.T(7409, 0, 22))), i);
                                                    var j = $7.W(7445, 'j', $7.F(7441, $7.I(typeof parseInt === 'undefined' ? $7.R(7425, 'parseInt', undefined) : $7.R(7425, 'parseInt', parseInt)), false)($7.G(7437, $7.R(7429, 'place', place), $7.T(7433, 1, 22))), j);
                                                    var mtable = $7.W(7741, 'mtable', $7.T(7737, {
                                                            0: $7.T(7481, {
                                                                0: $7.T(7449, 100, 22),
                                                                1: $7.U(902, '-', $7.T(7453, 50, 22)),
                                                                2: $7.T(7457, 40, 22),
                                                                3: $7.T(7461, 30, 22),
                                                                4: $7.T(7465, 30, 22),
                                                                5: $7.T(7469, 40, 22),
                                                                6: $7.U(906, '-', $7.T(7473, 50, 22)),
                                                                7: $7.T(7477, 100, 22)
                                                            }, 11),
                                                            1: $7.T(7517, {
                                                                0: $7.U(910, '-', $7.T(7485, 50, 22)),
                                                                1: $7.U(914, '-', $7.T(7489, 30, 22)),
                                                                2: $7.T(7493, 5, 22),
                                                                3: $7.T(7497, 1, 22),
                                                                4: $7.T(7501, 1, 22),
                                                                5: $7.T(7505, 5, 22),
                                                                6: $7.U(918, '-', $7.T(7509, 30, 22)),
                                                                7: $7.U(922, '-', $7.T(7513, 50, 22))
                                                            }, 11),
                                                            2: $7.T(7553, {
                                                                0: $7.T(7521, 40, 22),
                                                                1: $7.T(7525, 5, 22),
                                                                2: $7.T(7529, 20, 22),
                                                                3: $7.T(7533, 10, 22),
                                                                4: $7.T(7537, 10, 22),
                                                                5: $7.T(7541, 20, 22),
                                                                6: $7.T(7545, 5, 22),
                                                                7: $7.T(7549, 40, 22)
                                                            }, 11),
                                                            3: $7.T(7589, {
                                                                0: $7.T(7557, 30, 22),
                                                                1: $7.T(7561, 1, 22),
                                                                2: $7.T(7565, 10, 22),
                                                                3: $7.T(7569, 0, 22),
                                                                4: $7.T(7573, 0, 22),
                                                                5: $7.T(7577, 10, 22),
                                                                6: $7.T(7581, 1, 22),
                                                                7: $7.T(7585, 30, 22)
                                                            }, 11),
                                                            4: $7.T(7625, {
                                                                0: $7.T(7593, 30, 22),
                                                                1: $7.T(7597, 1, 22),
                                                                2: $7.T(7601, 10, 22),
                                                                3: $7.T(7605, 0, 22),
                                                                4: $7.T(7609, 0, 22),
                                                                5: $7.T(7613, 10, 22),
                                                                6: $7.T(7617, 1, 22),
                                                                7: $7.T(7621, 30, 22)
                                                            }, 11),
                                                            5: $7.T(7661, {
                                                                0: $7.T(7629, 40, 22),
                                                                1: $7.T(7633, 5, 22),
                                                                2: $7.T(7637, 20, 22),
                                                                3: $7.T(7641, 10, 22),
                                                                4: $7.T(7645, 10, 22),
                                                                5: $7.T(7649, 20, 22),
                                                                6: $7.T(7653, 5, 22),
                                                                7: $7.T(7657, 40, 22)
                                                            }, 11),
                                                            6: $7.T(7697, {
                                                                0: $7.U(926, '-', $7.T(7665, 50, 22)),
                                                                1: $7.U(930, '-', $7.T(7669, 30, 22)),
                                                                2: $7.T(7673, 5, 22),
                                                                3: $7.T(7677, 1, 22),
                                                                4: $7.T(7681, 1, 22),
                                                                5: $7.T(7685, 5, 22),
                                                                6: $7.U(934, '-', $7.T(7689, 30, 22)),
                                                                7: $7.U(938, '-', $7.T(7693, 50, 22))
                                                            }, 11),
                                                            7: $7.T(7733, {
                                                                0: $7.T(7701, 100, 22),
                                                                1: $7.U(942, '-', $7.T(7705, 50, 22)),
                                                                2: $7.T(7709, 40, 22),
                                                                3: $7.T(7713, 30, 22),
                                                                4: $7.T(7717, 30, 22),
                                                                5: $7.T(7721, 40, 22),
                                                                6: $7.U(946, '-', $7.T(7725, 50, 22)),
                                                                7: $7.T(7729, 100, 22)
                                                            }, 11)
                                                        }, 11), mtable);
                                                    return $7.Rt(7773, $7.F(7769, $7.I(typeof parseInt === 'undefined' ? $7.R(7745, 'parseInt', undefined) : $7.R(7745, 'parseInt', parseInt)), false)($7.G(7765, $7.G(7757, $7.R(7749, 'mtable', mtable), $7.R(7753, 'i', i)), $7.R(7761, 'j', j))));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11221))
                                                        continue jalangiLabel26;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    evaluate: $7.T(9165, function (place, _color, _board, _level, _heap) {
                                        jalangiLabel27:
                                            while (true) {
                                                try {
                                                    $7.Fe(9057, arguments.callee, this);
                                                    $7.N(9061, 'arguments', arguments, true);
                                                    $7.N(9065, 'place', place, true);
                                                    $7.N(9069, '_color', _color, true);
                                                    $7.N(9073, '_board', _board, true);
                                                    $7.N(9077, '_level', _level, true);
                                                    $7.N(9081, '_heap', _heap, true);
                                                    $7.N(9085, 'ret', ret, false);
                                                    $7.N(9089, 'level', level, false);
                                                    $7.N(9093, 'heap', heap, false);
                                                    $7.N(9097, 'toEndLevel', toEndLevel, false);
                                                    $7.N(9101, 'nextValue', nextValue, false);
                                                    $7.N(9105, 'color', color, false);
                                                    $7.N(9109, 'board', board, false);
                                                    $7.N(9113, 'revColor', revColor, false);
                                                    $7.N(9117, 'sym', sym, false);
                                                    $7.N(9121, 'path', path, false);
                                                    $7.N(9125, 'cp', cp, false);
                                                    $7.N(9129, 'up', up, false);
                                                    $7.N(9133, 'act', act, false);
                                                    $7.N(9137, 'cv', cv, false);
                                                    $7.N(9141, 'uv', uv, false);
                                                    $7.N(9145, 'cc', cc, false);
                                                    $7.N(9149, 'uc', uc, false);
                                                    $7.N(9153, 'i', i, false);
                                                    $7.N(9157, 'j', j, false);
                                                    $7.N(9161, 'p', p, false);
                                                    var ret = $7.W(7821, 'ret', $7.U(950, '-', $7.T(7817, 100000, 22)), ret);
                                                    var level = $7.W(7837, 'level', $7.C(428, $7.R(7825, '_level', _level)) ? $7._() : $7.G(7833, $7.R(7829, 'this', this), 'level'), level);
                                                    var heap = $7.W(7853, 'heap', $7.C(432, $7.R(7841, '_heap', _heap)) ? $7._() : $7.G(7849, $7.R(7845, 'this', this), 'heap'), heap);
                                                    if ($7.C(436, $7.B(962, '==', $7.U(958, 'typeof', $7.G(7909, $7.G(7865, $7.R(7857, 'heap', heap), $7.T(7861, 'nextLevel', 21)), $7.B(954, '+', $7.F(7885, $7.I(typeof String === 'undefined' ? $7.R(7869, 'String', undefined) : $7.R(7869, 'String', String)), false)($7.G(7881, $7.R(7873, 'place', place), $7.T(7877, 0, 22))), $7.F(7905, $7.I(typeof String === 'undefined' ? $7.R(7889, 'String', undefined) : $7.R(7889, 'String', String)), false)($7.G(7901, $7.R(7893, 'place', place), $7.T(7897, 1, 22)))))), $7.T(7913, 'undefined', 21)))) {
                                                        $7.P(7973, $7.G(7925, $7.R(7917, 'heap', heap), $7.T(7921, 'nextLevel', 21)), $7.B(966, '+', $7.F(7945, $7.I(typeof String === 'undefined' ? $7.R(7929, 'String', undefined) : $7.R(7929, 'String', String)), false)($7.G(7941, $7.R(7933, 'place', place), $7.T(7937, 0, 22))), $7.F(7965, $7.I(typeof String === 'undefined' ? $7.R(7949, 'String', undefined) : $7.R(7949, 'String', String)), false)($7.G(7961, $7.R(7953, 'place', place), $7.T(7957, 1, 22)))), $7.T(7969, {}, 11));
                                                    }
                                                    heap = $7.W(8033, 'heap', $7.G(8029, $7.G(7985, $7.R(7977, 'heap', heap), $7.T(7981, 'nextLevel', 21)), $7.B(970, '+', $7.F(8005, $7.I(typeof String === 'undefined' ? $7.R(7989, 'String', undefined) : $7.R(7989, 'String', String)), false)($7.G(8001, $7.R(7993, 'place', place), $7.T(7997, 0, 22))), $7.F(8025, $7.I(typeof String === 'undefined' ? $7.R(8009, 'String', undefined) : $7.R(8009, 'String', String)), false)($7.G(8021, $7.R(8013, 'place', place), $7.T(8017, 1, 22))))), heap);
                                                    level = $7.W(8049, 'level', $7.F(8045, $7.I(typeof parseInt === 'undefined' ? $7.R(8037, 'parseInt', undefined) : $7.R(8037, 'parseInt', parseInt)), false)($7.R(8041, 'level', level)), level);
                                                    var toEndLevel = $7.W(8073, 'toEndLevel', $7.B(974, '-', $7.T(8053, 64, 22), $7.F(8069, $7.I(typeof parseInt === 'undefined' ? $7.R(8057, 'parseInt', undefined) : $7.R(8057, 'parseInt', parseInt)), false)($7.G(8065, $7.R(8061, 'this', this), 'step'))), toEndLevel);
                                                    level = $7.W(8093, 'level', $7.C(440, $7.B(978, '>', $7.R(8077, 'level', level), $7.R(8081, 'toEndLevel', toEndLevel))) ? $7.R(8085, 'toEndLevel', toEndLevel) : $7.R(8089, 'level', level), level);
                                                    var nextValue = $7.W(8101, 'nextValue', $7.T(8097, 0, 22), nextValue);
                                                    var color = $7.W(8113, 'color', $7.C(444, $7.R(8105, '_color', _color)) ? $7._() : $7.T(8109, 'white', 21), color);
                                                    var board = $7.W(8129, 'board', $7.C(448, $7.R(8117, '_board', _board)) ? $7._() : $7.G(8125, $7.R(8121, 'this', this), 'board'), board);
                                                    board = $7.W(8145, 'board', $7.M(8141, $7.R(8133, 'this', this), 'getClone', false)($7.R(8137, 'board', board)), board);
                                                    var revColor = $7.W(8165, 'revColor', $7.C(452, $7.B(982, '==', $7.R(8149, 'color', color), $7.T(8153, 'white', 21))) ? $7.T(8157, 'black', 21) : $7.T(8161, 'white', 21), revColor);
                                                    var sym = $7.W(8185, 'sym', $7.C(456, $7.B(986, '==', $7.R(8169, 'color', color), $7.T(8173, 'white', 21))) ? $7.T(8177, 1, 22) : $7.U(990, '-', $7.T(8181, 1, 22)), sym);
                                                    $7.P(8225, $7.G(8205, $7.R(8189, 'board', board), $7.G(8201, $7.R(8193, 'place', place), $7.T(8197, 0, 22))), $7.G(8217, $7.R(8209, 'place', place), $7.T(8213, 1, 22)), $7.R(8221, 'color', color));
                                                    var path;
                                                    var cp;
                                                    var up;
                                                    if ($7.C(484, $7.B(998, '!=', $7.U(994, 'typeof', $7.G(8237, $7.R(8229, 'heap', heap), $7.T(8233, 'value', 21))), $7.T(8241, 'undefined', 21)))) {
                                                        path = $7.W(8257, 'path', $7.G(8253, $7.R(8245, 'heap', heap), $7.T(8249, 'path', 21)), path);
                                                        ret = $7.W(8273, 'ret', $7.G(8269, $7.R(8261, 'heap', heap), $7.T(8265, 'value', 21)), ret);
                                                        cp = $7.W(8289, 'cp', $7.G(8285, $7.R(8277, 'heap', heap), $7.T(8281, 'cpossible', 21)), cp);
                                                        up = $7.W(8305, 'up', $7.G(8301, $7.R(8293, 'heap', heap), $7.T(8297, 'upossible', 21)), up);
                                                        board = $7.W(8325, 'board', $7.M(8321, $7.R(8309, 'this', this), 'doRevert', false)($7.R(8313, 'heap', heap), $7.R(8317, 'board', board)), board);
                                                    } else {
                                                        var act = $7.W(8349, 'act', $7.M(8345, $7.R(8329, 'this', this), 'getRevertPath', false)($7.R(8333, 'place', place), $7.R(8337, 'color', color), $7.R(8341, 'board', board)), act);
                                                        $7.P(8373, $7.R(8353, 'heap', heap), $7.T(8357, 'path', 21), $7.G(8369, $7.R(8361, 'act', act), $7.T(8365, 'path', 21)));
                                                        $7.P(8389, $7.R(8377, 'heap', heap), $7.T(8381, 'color', 21), $7.R(8385, 'color', color));
                                                        $7.P(8405, $7.R(8393, 'heap', heap), $7.T(8397, 'place', 21), $7.R(8401, 'place', place));
                                                        board = $7.W(8425, 'board', $7.M(8421, $7.R(8409, 'this', this), 'doRevert', false)($7.R(8413, 'heap', heap), $7.R(8417, 'board', board)), board);
                                                        cp = $7.W(8445, 'cp', $7.M(8441, $7.R(8429, 'this', this), 'possiblePlace', false)($7.R(8433, 'color', color), $7.R(8437, 'board', board)), cp);
                                                        up = $7.W(8465, 'up', $7.M(8461, $7.R(8449, 'this', this), 'possiblePlace', false)($7.R(8453, 'revColor', revColor), $7.R(8457, 'board', board)), up);
                                                        var cv = $7.W(8473, 'cv', $7.T(8469, 0, 22), cv);
                                                        var uv = $7.W(8481, 'uv', $7.T(8477, 0, 22), uv);
                                                        var cc = $7.W(8489, 'cc', $7.T(8485, 0, 22), cc);
                                                        var uc = $7.W(8497, 'uc', $7.T(8493, 0, 22), uc);
                                                        for (var i = $7.W(8505, 'i', $7.T(8501, 0, 22), i); $7.C(472, $7.B(1002, '<', $7.R(8509, 'i', i), $7.G(8517, $7.R(8513, 'this', this), 'bounder'))); $7.B(1010, '-', i = $7.W(8525, 'i', $7.B(1006, '+', $7.R(8521, 'i', i), 1), i), 1)) {
                                                            for (var j = $7.W(8533, 'j', $7.T(8529, 0, 22), j); $7.C(468, $7.B(1014, '<', $7.R(8537, 'j', j), $7.G(8545, $7.R(8541, 'this', this), 'bounder'))); $7.B(1022, '-', j = $7.W(8553, 'j', $7.B(1018, '+', $7.R(8549, 'j', j), 1), j), 1)) {
                                                                if ($7.C(464, $7.B(1026, '===', $7.G(8573, $7.G(8565, $7.R(8557, 'board', board), $7.R(8561, 'i', i)), $7.R(8569, 'j', j)), $7.R(8577, 'color', color)))) {
                                                                    cv = $7.W(8609, 'cv', $7.B(1030, '+', $7.R(8605, 'cv', cv), $7.M(8601, $7.R(8581, 'this', this), 'getValue', false)($7.T(8593, [
                                                                        $7.R(8585, 'i', i),
                                                                        $7.R(8589, 'j', j)
                                                                    ], 10), $7.R(8597, 'board', board))), cv);
                                                                    $7.B(1038, '-', cc = $7.W(8617, 'cc', $7.B(1034, '+', $7.R(8613, 'cc', cc), 1), cc), 1);
                                                                } else if ($7.C(460, $7.B(1042, '===', $7.G(8637, $7.G(8629, $7.R(8621, 'board', board), $7.R(8625, 'i', i)), $7.R(8633, 'j', j)), $7.R(8641, 'revColor', revColor)))) {
                                                                    uv = $7.W(8673, 'uv', $7.B(1046, '+', $7.R(8669, 'uv', uv), $7.M(8665, $7.R(8645, 'this', this), 'getValue', false)($7.T(8657, [
                                                                        $7.R(8649, 'i', i),
                                                                        $7.R(8653, 'j', j)
                                                                    ], 10), $7.R(8661, 'board', board))), uv);
                                                                    $7.B(1054, '-', uc = $7.W(8681, 'uc', $7.B(1050, '+', $7.R(8677, 'uc', uc), 1), uc), 1);
                                                                }
                                                            }
                                                        }
                                                        ret = $7.W(8705, 'ret', $7.B(1062, '*', $7.B(1058, '-', $7.G(8689, $7.R(8685, 'cp', cp), 'length'), $7.G(8697, $7.R(8693, 'up', up), 'length')), $7.T(8701, 10, 22)), ret);
                                                        ret = $7.W(8725, 'ret', $7.B(1074, '+', $7.R(8721, 'ret', ret), $7.B(1070, '*', $7.B(1066, '-', $7.R(8709, 'cv', cv), $7.R(8713, 'uv', uv)), $7.T(8717, 2, 22))), ret);
                                                        if ($7.C(480, $7.C(476, $7.B(1078, '==', $7.G(8733, $7.R(8729, 'up', up), 'length'), $7.T(8737, 0, 22))) ? $7.B(1082, '>', $7.G(8745, $7.R(8741, 'cp', cp), 'length'), $7.T(8749, 0, 22)) : $7._()))
                                                            ret = $7.W(8757, 'ret', $7.T(8753, 100000, 22), ret);
                                                        $7.P(8773, $7.R(8761, 'heap', heap), $7.T(8765, 'value', 21), $7.R(8769, 'ret', ret));
                                                        $7.P(8789, $7.R(8777, 'heap', heap), $7.T(8781, 'nextLevel', 21), $7.T(8785, {}, 11));
                                                        $7.P(8805, $7.R(8793, 'heap', heap), $7.T(8797, 'cpossible', 21), $7.R(8801, 'cp', cp));
                                                        $7.P(8821, $7.R(8809, 'heap', heap), $7.T(8813, 'upossible', 21), $7.R(8817, 'up', up));
                                                        $7.P(8837, $7.R(8825, 'heap', heap), $7.R(8829, 'color', color), $7.R(8833, 'cc', cc));
                                                        $7.P(8853, $7.R(8841, 'heap', heap), $7.R(8845, 'revColor', revColor), $7.R(8849, 'uc', uc));
                                                    }
                                                    if ($7.C(504, $7.C(492, $7.B(1086, '>', $7.R(8857, 'level', level), $7.T(8861, 1, 22))) ? $7.C(488, $7.B(1090, '>', $7.G(8869, $7.R(8865, 'up', up), 'length'), $7.T(8873, 0, 22))) ? $7._() : $7.B(1094, '>', $7.G(8881, $7.R(8877, 'cp', cp), 'length'), $7.T(8885, 0, 22)) : $7._())) {
                                                        if ($7.C(496, $7.B(1098, '==', $7.G(8893, $7.R(8889, 'up', up), 'length'), $7.T(8897, 0, 22)))) {
                                                            up = $7.W(8905, 'up', $7.R(8901, 'cp', cp), up);
                                                            revColor = $7.W(8913, 'revColor', $7.R(8909, 'color', color), revColor);
                                                        }
                                                        up = $7.W(8929, 'up', $7.M(8925, $7.R(8917, 'this', this), 'getBestPlaceSet', false)($7.R(8921, 'up', up)), up);
                                                        for (var p in $7.H(8985, $7.R(8933, 'up', up))) {
                                                            nextValue = $7.W(8981, 'nextValue', $7.B(1106, '+', $7.R(8977, 'nextValue', nextValue), $7.M(8973, $7.R(8937, 'this', this), 'evaluate', false)($7.G(8949, $7.R(8941, 'up', up), $7.R(8945, 'p', p)), $7.R(8953, 'revColor', revColor), $7.R(8957, 'board', board), $7.B(1102, '-', $7.R(8961, 'level', level), $7.T(8965, 1, 22)), $7.R(8969, 'heap', heap))), nextValue);
                                                        }
                                                        if ($7.C(500, $7.B(1110, '>', $7.G(8993, $7.R(8989, 'up', up), 'length'), $7.T(8997, 0, 22)))) {
                                                            nextValue = $7.W(9013, 'nextValue', $7.B(1114, '/', $7.R(9001, 'nextValue', nextValue), $7.G(9009, $7.R(9005, 'up', up), 'length')), nextValue);
                                                            ret = $7.W(9041, 'ret', $7.M(9037, $7.I(typeof Math === 'undefined' ? $7.R(9017, 'Math', undefined) : $7.R(9017, 'Math', Math)), 'round', false)($7.B(1126, '+', $7.B(1118, '*', $7.R(9021, 'ret', ret), $7.T(9025, 0.5, 22)), $7.B(1122, '*', $7.R(9029, 'nextValue', nextValue), $7.T(9033, 0.5, 22)))), ret);
                                                        }
                                                    }
                                                    return $7.Rt(9053, $7.B(1130, '*', $7.R(9045, 'ret', ret), $7.R(9049, 'sym', sym)));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11225))
                                                        continue jalangiLabel27;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    getBestPlaceSet: $7.T(9369, function (possible) {
                                        jalangiLabel28:
                                            while (true) {
                                                try {
                                                    $7.Fe(9337, arguments.callee, this);
                                                    $7.N(9341, 'arguments', arguments, true);
                                                    $7.N(9345, 'possible', possible, true);
                                                    $7.N(9349, 'best', best, false);
                                                    $7.N(9353, 'middle', middle, false);
                                                    $7.N(9357, 'ret', ret, false);
                                                    $7.N(9361, 'i', i, false);
                                                    $7.N(9365, 't', t, false);
                                                    var best = $7.W(9173, 'best', $7.T(9169, [], 10), best);
                                                    var middle = $7.W(9181, 'middle', $7.T(9177, [], 10), middle);
                                                    var ret = $7.W(9189, 'ret', $7.T(9185, [], 10), ret);
                                                    for (var i in $7.H(9277, $7.R(9193, 'possible', possible))) {
                                                        var t = $7.W(9217, 't', $7.M(9213, $7.R(9197, 'this', this), 'getValue', false)($7.G(9209, $7.R(9201, 'possible', possible), $7.R(9205, 'i', i))), t);
                                                        if ($7.C(512, $7.B(1134, '==', $7.R(9221, 't', t), $7.T(9225, 100, 22)))) {
                                                            $7.M(9245, $7.R(9229, 'best', best), 'push', false)($7.G(9241, $7.R(9233, 'possible', possible), $7.R(9237, 'i', i)));
                                                        } else if ($7.C(508, $7.B(1138, '>=', $7.R(9249, 't', t), $7.T(9253, 0, 22)))) {
                                                            $7.M(9273, $7.R(9257, 'middle', middle), 'push', false)($7.G(9269, $7.R(9261, 'possible', possible), $7.R(9265, 'i', i)));
                                                        }
                                                    }
                                                    if ($7.C(520, $7.B(1142, '>', $7.G(9285, $7.R(9281, 'best', best), 'length'), $7.T(9289, 0, 22)))) {
                                                        ret = $7.W(9297, 'ret', $7.R(9293, 'best', best), ret);
                                                    } else if ($7.C(516, $7.B(1146, '>', $7.G(9305, $7.R(9301, 'middle', middle), 'length'), $7.T(9309, 0, 22)))) {
                                                        ret = $7.W(9317, 'ret', $7.R(9313, 'middle', middle), ret);
                                                    } else {
                                                        ret = $7.W(9325, 'ret', $7.R(9321, 'possible', possible), ret);
                                                    }
                                                    return $7.Rt(9333, $7.R(9329, 'ret', ret));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11229))
                                                        continue jalangiLabel28;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12),
                                    bestPlace: $7.T(9597, function (possible) {
                                        jalangiLabel29:
                                            while (true) {
                                                try {
                                                    $7.Fe(9569, arguments.callee, this);
                                                    $7.N(9573, 'arguments', arguments, true);
                                                    $7.N(9577, 'possible', possible, true);
                                                    $7.N(9581, 'ret', ret, false);
                                                    $7.N(9585, 'value', value, false);
                                                    $7.N(9589, 'p', p, false);
                                                    $7.N(9593, 'v', v, false);
                                                    if ($7.C(524, $7.B(1150, '==', $7.G(9377, $7.R(9373, 'possible', possible), 'length'), $7.T(9381, 0, 22))))
                                                        $7.M(9393, $7.I(typeof console === 'undefined' ? $7.R(9385, 'console', undefined) : $7.R(9385, 'console', console)), 'log', false)($7.T(9389, 'Error: No possible places?!!!', 21));
                                                    possible = $7.W(9409, 'possible', $7.M(9405, $7.R(9397, 'this', this), 'getBestPlaceSet', false)($7.R(9401, 'possible', possible)), possible);
                                                    var ret = $7.W(9417, 'ret', $7.T(9413, [], 10), ret);
                                                    if ($7.C(536, $7.B(1154, '>', $7.G(9425, $7.R(9421, 'possible', possible), 'length'), $7.T(9429, 0, 22)))) {
                                                        ret = $7.W(9445, 'ret', $7.G(9441, $7.R(9433, 'possible', possible), $7.T(9437, 0, 22)), ret);
                                                        var value = $7.W(9461, 'value', $7.M(9457, $7.R(9449, 'this', this), 'evaluate', false)($7.R(9453, 'ret', ret)), value);
                                                        for (var p = $7.W(9469, 'p', $7.T(9465, 1, 22), p); $7.C(532, $7.B(1158, '<', $7.R(9473, 'p', p), $7.G(9481, $7.R(9477, 'possible', possible), 'length'))); $7.B(1166, '-', p = $7.W(9489, 'p', $7.B(1162, '+', $7.R(9485, 'p', p), 1), p), 1)) {
                                                            var v = $7.W(9513, 'v', $7.M(9509, $7.R(9493, 'this', this), 'evaluate', false)($7.G(9505, $7.R(9497, 'possible', possible), $7.R(9501, 'p', p))), v);
                                                            if ($7.C(528, $7.B(1170, '>', $7.R(9517, 'v', v), $7.R(9521, 'value', value)))) {
                                                                value = $7.W(9529, 'value', $7.R(9525, 'v', v), value);
                                                                ret = $7.W(9545, 'ret', $7.G(9541, $7.R(9533, 'possible', possible), $7.R(9537, 'p', p)), ret);
                                                            }
                                                        }
                                                    } else {
                                                        $7.M(9557, $7.I(typeof console === 'undefined' ? $7.R(9549, 'console', undefined) : $7.R(9549, 'console', console)), 'log', false)($7.T(9553, 'Error: No Setting place for Computer', 21));
                                                    }
                                                    return $7.Rt(9565, $7.R(9561, 'ret', ret));
                                                } catch ($7e) {
                                                    console.log($7e);
                                                    console.log($7e.stack);
                                                    throw $7e;
                                                } finally {
                                                    if ($7.Fr(11233))
                                                        continue jalangiLabel29;
                                                    else
                                                        return $7.Ra();
                                                }
                                            }
                                    }, 12)
                                }, 11), w);
                            return $7.Rt(9613, $7.R(9609, 'w', w));
                        } catch ($7e) {
                            console.log($7e);
                            console.log($7e.stack);
                            throw $7e;
                        } finally {
                            if ($7.Fr(11237))
                                continue jalangiLabel30;
                            else
                                return $7.Ra();
                        }
                    }
            }, 12), false)(), World);
        function getMessage(key, alter) {
            jalangiLabel33:
                while (true) {
                    try {
                        $7.Fe(9865, arguments.callee, this);
                        $7.N(9869, 'arguments', arguments, true);
                        $7.N(9873, 'key', key, true);
                        $7.N(9877, 'alter', alter, true);
                        $7.N(9881, 'ret', ret, false);
                        var ret = $7.W(9649, 'ret', $7.C(540, $7.R(9641, 'alter', alter)) ? $7._() : $7.T(9645, '', 21), ret);
                        if ($7.C(568, $7.C(548, $7.C(544, $7.G(9657, $7.I(typeof window === 'undefined' ? $7.R(9653, 'window', undefined) : $7.R(9653, 'window', window)), 'chrome')) ? $7.G(9669, $7.G(9665, $7.I(typeof window === 'undefined' ? $7.R(9661, 'window', undefined) : $7.R(9661, 'window', window)), 'chrome'), 'i18n') : $7._()) ? $7.G(9685, $7.G(9681, $7.G(9677, $7.I(typeof window === 'undefined' ? $7.R(9673, 'window', undefined) : $7.R(9673, 'window', window)), 'chrome'), 'i18n'), 'getMessage') : $7._())) {
                            ret = $7.W(9705, 'ret', $7.M(9701, $7.G(9693, $7.I(typeof chrome === 'undefined' ? $7.R(9689, 'chrome', undefined) : $7.R(9689, 'chrome', chrome)), 'i18n'), 'getMessage', false)($7.R(9697, 'key', key)), ret);
                        } else {
                            if ($7.C(552, $7.B(1178, '==', $7.U(1174, 'typeof', $7.G(9713, $7.R(9709, 'this', this), 'messages')), $7.T(9717, 'undefined', 21)))) {
                                $7.M(9781, $7.M(9757, $7.I(typeof $ === 'undefined' ? $7.R(9721, '$', undefined) : $7.R(9721, '$', $)), 'getJSON', false)($7.T(9725, '_locales/en/messages.json', 21), $7.T(9753, function (data) {
                                    jalangiLabel31:
                                        while (true) {
                                            try {
                                                $7.Fe(9741, arguments.callee, this);
                                                $7.N(9745, 'arguments', arguments, true);
                                                $7.N(9749, 'data', data, true);
                                                $7.P(9737, $7.R(9729, 'this', this), 'messages', $7.R(9733, 'data', data));
                                            } catch ($7e) {
                                                console.log($7e);
                                                console.log($7e.stack);
                                                throw $7e;
                                            } finally {
                                                if ($7.Fr(11241))
                                                    continue jalangiLabel31;
                                                else
                                                    return $7.Ra();
                                            }
                                        }
                                }, 12)), 'error', false)($7.T(9777, function () {
                                    jalangiLabel32:
                                        while (true) {
                                            try {
                                                $7.Fe(9769, arguments.callee, this);
                                                $7.N(9773, 'arguments', arguments, true);
                                                return $7.Rt(9765, $7.R(9761, 'ret', ret));
                                            } catch ($7e) {
                                                console.log($7e);
                                                console.log($7e.stack);
                                                throw $7e;
                                            } finally {
                                                if ($7.Fr(11245))
                                                    continue jalangiLabel32;
                                                else
                                                    return $7.Ra();
                                            }
                                        }
                                }, 12));
                            }
                            if ($7.C(564, $7.C(560, $7.C(556, $7.G(9789, $7.R(9785, 'this', this), 'messages')) ? $7.M(9805, $7.G(9797, $7.R(9793, 'this', this), 'messages'), 'hasOwnProperty', false)($7.R(9801, 'key', key)) : $7._()) ? $7.M(9829, $7.G(9821, $7.G(9813, $7.R(9809, 'this', this), 'messages'), $7.R(9817, 'key', key)), 'hasOwnProperty', false)($7.T(9825, 'message', 21)) : $7._())) {
                                ret = $7.W(9853, 'ret', $7.G(9849, $7.G(9845, $7.G(9837, $7.R(9833, 'this', this), 'messages'), $7.R(9841, 'key', key)), 'message'), ret);
                            }
                        }
                        return $7.Rt(9861, $7.R(9857, 'ret', ret));
                    } catch ($7e) {
                        console.log($7e);
                        console.log($7e.stack);
                        throw $7e;
                    } finally {
                        if ($7.Fr(11249))
                            continue jalangiLabel33;
                        else
                            return $7.Ra();
                    }
                }
        }
        $7.M(11093, $7.F(9893, $7.I(typeof $ === 'undefined' ? $7.R(9885, '$', undefined) : $7.R(9885, '$', $)), false)($7.I(typeof document === 'undefined' ? $7.R(9889, 'document', undefined) : $7.R(9889, 'document', document))), 'ready', false)($7.T(11089, function () {
            jalangiLabel46:
                while (true) {
                    try {
                        $7.Fe(11081, arguments.callee, this);
                        $7.N(11085, 'arguments', arguments, true);
                        $7.F(9909, $7.I(typeof license_init === 'undefined' ? $7.R(9897, 'license_init', undefined) : $7.R(9897, 'license_init', license_init)), false)($7.T(9901, 'license', 21), $7.T(9905, 'open', 21));
                        $7.M(9941, $7.F(9921, $7.I(typeof $ === 'undefined' ? $7.R(9913, '$', undefined) : $7.R(9913, '$', $)), false)($7.T(9917, 'title', 21)), 'html', false)($7.F(9937, $7.R(9925, 'getMessage', getMessage), false)($7.T(9929, 'name', 21), $7.T(9933, 'Annex', 21)));
                        $7.M(9973, $7.F(9953, $7.I(typeof $ === 'undefined' ? $7.R(9945, '$', undefined) : $7.R(9945, '$', $)), false)($7.T(9949, '#open1', 21)), 'html', false)($7.F(9969, $7.R(9957, 'getMessage', getMessage), false)($7.T(9961, '1PlayerGame', 21), $7.T(9965, '1 Player Game', 21)));
                        $7.M(10005, $7.F(9985, $7.I(typeof $ === 'undefined' ? $7.R(9977, '$', undefined) : $7.R(9977, '$', $)), false)($7.T(9981, '#open2', 21)), 'html', false)($7.F(10001, $7.R(9989, 'getMessage', getMessage), false)($7.T(9993, '2PlayerGame', 21), $7.T(9997, '2 Player Game', 21)));
                        $7.M(10037, $7.F(10017, $7.I(typeof $ === 'undefined' ? $7.R(10009, '$', undefined) : $7.R(10009, '$', $)), false)($7.T(10013, '#open_help', 21)), 'html', false)($7.F(10033, $7.R(10021, 'getMessage', getMessage), false)($7.T(10025, 'howtoPlay', 21), $7.T(10029, 'How to Play', 21)));
                        $7.M(10069, $7.F(10049, $7.I(typeof $ === 'undefined' ? $7.R(10041, '$', undefined) : $7.R(10041, '$', $)), false)($7.T(10045, '#open_exit', 21)), 'html', false)($7.F(10065, $7.R(10053, 'getMessage', getMessage), false)($7.T(10057, 'exit', 21), $7.T(10061, 'Exit', 21)));
                        $7.M(10101, $7.F(10081, $7.I(typeof $ === 'undefined' ? $7.R(10073, '$', undefined) : $7.R(10073, '$', $)), false)($7.T(10077, '.play1_pieces_lable', 21)), 'html', false)($7.F(10097, $7.R(10085, 'getMessage', getMessage), false)($7.T(10089, 'pieces', 21), $7.T(10093, 'pieces', 21)));
                        $7.M(10133, $7.F(10113, $7.I(typeof $ === 'undefined' ? $7.R(10105, '$', undefined) : $7.R(10105, '$', $)), false)($7.T(10109, '.play2_pieces_lable', 21)), 'html', false)($7.F(10129, $7.R(10117, 'getMessage', getMessage), false)($7.T(10121, 'pieces', 21), $7.T(10125, 'pieces', 21)));
                        $7.M(10165, $7.F(10145, $7.I(typeof $ === 'undefined' ? $7.R(10137, '$', undefined) : $7.R(10137, '$', $)), false)($7.T(10141, '#turn', 21)), 'html', false)($7.F(10161, $7.R(10149, 'getMessage', getMessage), false)($7.T(10153, 'turn', 21), $7.T(10157, '\'s Turn', 21)));
                        $7.M(10197, $7.F(10177, $7.I(typeof $ === 'undefined' ? $7.R(10169, '$', undefined) : $7.R(10169, '$', $)), false)($7.T(10173, '.result_new_p1', 21)), 'html', false)($7.F(10193, $7.R(10181, 'getMessage', getMessage), false)($7.T(10185, 'newOneGame', 21), $7.T(10189, 'New 1P Game', 21)));
                        $7.M(10229, $7.F(10209, $7.I(typeof $ === 'undefined' ? $7.R(10201, '$', undefined) : $7.R(10201, '$', $)), false)($7.T(10205, '.result_new_p2', 21)), 'html', false)($7.F(10225, $7.R(10213, 'getMessage', getMessage), false)($7.T(10217, 'newTwoGame', 21), $7.T(10221, 'New 2P Game', 21)));
                        $7.M(10261, $7.F(10241, $7.I(typeof $ === 'undefined' ? $7.R(10233, '$', undefined) : $7.R(10233, '$', $)), false)($7.T(10237, '.result_exit', 21)), 'html', false)($7.F(10257, $7.R(10245, 'getMessage', getMessage), false)($7.T(10249, 'exit', 21), $7.T(10253, 'Exit', 21)));
                        $7.M(10293, $7.F(10273, $7.I(typeof $ === 'undefined' ? $7.R(10265, '$', undefined) : $7.R(10265, '$', $)), false)($7.T(10269, '.help_title', 21)), 'html', false)($7.F(10289, $7.R(10277, 'getMessage', getMessage), false)($7.T(10281, 'howtoPlay', 21), $7.T(10285, 'How to Play', 21)));
                        $7.M(10325, $7.F(10305, $7.I(typeof $ === 'undefined' ? $7.R(10297, '$', undefined) : $7.R(10297, '$', $)), false)($7.T(10301, '.help_contain', 21)), 'html', false)($7.F(10321, $7.R(10309, 'getMessage', getMessage), false)($7.T(10313, 'help', 21), $7.T(10317, 'Play a piece on the board so that one or more of your opponent\u2019s pieces are between two of your pieces. All of the opponent\u2019s pieces between your own turn over and become your color.<br>The player with the most pieces on the board at the end of the game wins!', 21)));
                        $7.M(10357, $7.F(10337, $7.I(typeof $ === 'undefined' ? $7.R(10329, '$', undefined) : $7.R(10329, '$', $)), false)($7.T(10333, '.help_exit', 21)), 'html', false)($7.F(10353, $7.R(10341, 'getMessage', getMessage), false)($7.T(10345, 'goBack', 21), $7.T(10349, 'Go Back', 21)));
                        $7.M(10389, $7.F(10369, $7.I(typeof $ === 'undefined' ? $7.R(10361, '$', undefined) : $7.R(10361, '$', $)), false)($7.T(10365, '#license', 21)), 'html', false)($7.F(10385, $7.R(10373, 'getMessage', getMessage), false)($7.T(10377, 'license', 21), $7.T(10381, 'License', 21)));
                        $7.M(10421, $7.F(10401, $7.I(typeof $ === 'undefined' ? $7.R(10393, '$', undefined) : $7.R(10393, '$', $)), false)($7.T(10397, '#readme', 21)), 'html', false)($7.F(10417, $7.R(10405, 'getMessage', getMessage), false)($7.T(10409, 'readme', 21), $7.T(10413, 'Readme', 21)));
                        $7.M(10573, $7.M(10553, $7.M(10545, $7.M(10457, $7.F(10433, $7.I(typeof $ === 'undefined' ? $7.R(10425, '$', undefined) : $7.R(10425, '$', $)), false)($7.T(10429, '.configure_panel_startover', 21)), 'click', false)($7.T(10453, function () {
                            jalangiLabel34:
                                while (true) {
                                    try {
                                        $7.Fe(10445, arguments.callee, this);
                                        $7.N(10449, 'arguments', arguments, true);
                                        $7.M(10441, $7.R(10437, 'World', World), 'startOver', false)();
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11253))
                                            continue jalangiLabel34;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12)), 'hover', false)($7.T(10505, function () {
                            jalangiLabel35:
                                while (true) {
                                    try {
                                        $7.Fe(10497, arguments.callee, this);
                                        $7.N(10501, 'arguments', arguments, true);
                                        $7.M(10481, $7.F(10469, $7.I(typeof $ === 'undefined' ? $7.R(10461, '$', undefined) : $7.R(10461, '$', $)), false)($7.R(10465, 'this', this)), 'css', false)($7.T(10473, 'background-color', 21), $7.T(10477, '#222222', 21));
                                        $7.M(10493, $7.R(10485, 'World', World), 'playSound', false)($7.T(10489, 'snd_navmove', 21));
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11257))
                                            continue jalangiLabel35;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12), $7.T(10541, function () {
                            jalangiLabel36:
                                while (true) {
                                    try {
                                        $7.Fe(10533, arguments.callee, this);
                                        $7.N(10537, 'arguments', arguments, true);
                                        $7.M(10529, $7.F(10517, $7.I(typeof $ === 'undefined' ? $7.R(10509, '$', undefined) : $7.R(10509, '$', $)), false)($7.R(10513, 'this', this)), 'css', false)($7.T(10521, 'background-color', 21), $7.T(10525, '#000000', 21));
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11261))
                                            continue jalangiLabel36;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12)), 'find', false)($7.T(10549, '.configure_panel_text', 21)), 'html', false)($7.F(10569, $7.R(10557, 'getMessage', getMessage), false)($7.T(10561, 'startover', 21), $7.T(10565, 'Start over', 21)));
                        $7.M(10761, $7.M(10681, $7.F(10585, $7.I(typeof $ === 'undefined' ? $7.R(10577, '$', undefined) : $7.R(10577, '$', $)), false)($7.T(10581, '.configure_panel_newgame', 21)), 'hover', false)($7.T(10637, function (evt) {
                            jalangiLabel37:
                                while (true) {
                                    try {
                                        $7.Fe(10625, arguments.callee, this);
                                        $7.N(10629, 'arguments', arguments, true);
                                        $7.N(10633, 'evt', evt, true);
                                        $7.M(10609, $7.F(10597, $7.I(typeof $ === 'undefined' ? $7.R(10589, '$', undefined) : $7.R(10589, '$', $)), false)($7.R(10593, 'this', this)), 'css', false)($7.T(10601, 'background-color', 21), $7.T(10605, '#222222', 21));
                                        $7.M(10621, $7.R(10613, 'World', World), 'playSound', false)($7.T(10617, 'snd_navmove', 21));
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11265))
                                            continue jalangiLabel37;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12), $7.T(10677, function (evt) {
                            jalangiLabel38:
                                while (true) {
                                    try {
                                        $7.Fe(10665, arguments.callee, this);
                                        $7.N(10669, 'arguments', arguments, true);
                                        $7.N(10673, 'evt', evt, true);
                                        $7.M(10661, $7.F(10649, $7.I(typeof $ === 'undefined' ? $7.R(10641, '$', undefined) : $7.R(10641, '$', $)), false)($7.R(10645, 'this', this)), 'css', false)($7.T(10653, 'background-color', 21), $7.T(10657, '#000000', 21));
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11269))
                                            continue jalangiLabel38;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12)), 'click', false)($7.T(10757, function () {
                            jalangiLabel39:
                                while (true) {
                                    try {
                                        $7.Fe(10745, arguments.callee, this);
                                        $7.N(10749, 'arguments', arguments, true);
                                        $7.N(10753, 'n', n, false);
                                        var n = $7.W(10689, 'n', $7.T(10685, 1, 22), n);
                                        if ($7.C(572, $7.M(10709, $7.F(10701, $7.I(typeof $ === 'undefined' ? $7.R(10693, '$', undefined) : $7.R(10693, '$', $)), false)($7.R(10697, 'this', this)), 'hasClass', false)($7.T(10705, 'configure_panel_new2game', 21)))) {
                                            n = $7.W(10717, 'n', $7.T(10713, 2, 22), n);
                                        }
                                        $7.M(10729, $7.R(10721, 'World', World), 'playSound', false)($7.T(10725, 'snd_navclick', 21));
                                        $7.M(10741, $7.R(10733, 'World', World), 'init', false)($7.R(10737, 'n', n));
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11273))
                                            continue jalangiLabel39;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12));
                        $7.M(10913, $7.M(10893, $7.M(10885, $7.M(10797, $7.F(10773, $7.I(typeof $ === 'undefined' ? $7.R(10765, '$', undefined) : $7.R(10765, '$', $)), false)($7.T(10769, '.configure_panel_help', 21)), 'click', false)($7.T(10793, function () {
                            jalangiLabel40:
                                while (true) {
                                    try {
                                        $7.Fe(10785, arguments.callee, this);
                                        $7.N(10789, 'arguments', arguments, true);
                                        $7.M(10781, $7.R(10777, 'World', World), 'showHelp', false)();
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11277))
                                            continue jalangiLabel40;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12)), 'hover', false)($7.T(10845, function () {
                            jalangiLabel41:
                                while (true) {
                                    try {
                                        $7.Fe(10837, arguments.callee, this);
                                        $7.N(10841, 'arguments', arguments, true);
                                        $7.M(10821, $7.F(10809, $7.I(typeof $ === 'undefined' ? $7.R(10801, '$', undefined) : $7.R(10801, '$', $)), false)($7.R(10805, 'this', this)), 'css', false)($7.T(10813, 'background-color', 21), $7.T(10817, '#222222', 21));
                                        $7.M(10833, $7.R(10825, 'World', World), 'playSound', false)($7.T(10829, 'snd_navmove', 21));
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11281))
                                            continue jalangiLabel41;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12), $7.T(10881, function () {
                            jalangiLabel42:
                                while (true) {
                                    try {
                                        $7.Fe(10873, arguments.callee, this);
                                        $7.N(10877, 'arguments', arguments, true);
                                        $7.M(10869, $7.F(10857, $7.I(typeof $ === 'undefined' ? $7.R(10849, '$', undefined) : $7.R(10849, '$', $)), false)($7.R(10853, 'this', this)), 'css', false)($7.T(10861, 'background-color', 21), $7.T(10865, '#000000', 21));
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11285))
                                            continue jalangiLabel42;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12)), 'find', false)($7.T(10889, '.configure_panel_text', 21)), 'html', false)($7.F(10909, $7.R(10897, 'getMessage', getMessage), false)($7.T(10901, 'rules', 21), $7.T(10905, 'Rules', 21)));
                        $7.M(11065, $7.M(11045, $7.M(11037, $7.M(10949, $7.F(10925, $7.I(typeof $ === 'undefined' ? $7.R(10917, '$', undefined) : $7.R(10917, '$', $)), false)($7.T(10921, '.configure_panel_exit', 21)), 'click', false)($7.T(10945, function () {
                            jalangiLabel43:
                                while (true) {
                                    try {
                                        $7.Fe(10937, arguments.callee, this);
                                        $7.N(10941, 'arguments', arguments, true);
                                        $7.M(10933, $7.I(typeof window === 'undefined' ? $7.R(10929, 'window', undefined) : $7.R(10929, 'window', window)), 'close', false)();
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11289))
                                            continue jalangiLabel43;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12)), 'hover', false)($7.T(10997, function () {
                            jalangiLabel44:
                                while (true) {
                                    try {
                                        $7.Fe(10989, arguments.callee, this);
                                        $7.N(10993, 'arguments', arguments, true);
                                        $7.M(10973, $7.F(10961, $7.I(typeof $ === 'undefined' ? $7.R(10953, '$', undefined) : $7.R(10953, '$', $)), false)($7.R(10957, 'this', this)), 'css', false)($7.T(10965, 'background-color', 21), $7.T(10969, '#222222', 21));
                                        $7.M(10985, $7.R(10977, 'World', World), 'playSound', false)($7.T(10981, 'snd_navmove', 21));
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11293))
                                            continue jalangiLabel44;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12), $7.T(11033, function () {
                            jalangiLabel45:
                                while (true) {
                                    try {
                                        $7.Fe(11025, arguments.callee, this);
                                        $7.N(11029, 'arguments', arguments, true);
                                        $7.M(11021, $7.F(11009, $7.I(typeof $ === 'undefined' ? $7.R(11001, '$', undefined) : $7.R(11001, '$', $)), false)($7.R(11005, 'this', this)), 'css', false)($7.T(11013, 'background-color', 21), $7.T(11017, '#000000', 21));
                                    } catch ($7e) {
                                        console.log($7e);
                                        console.log($7e.stack);
                                        throw $7e;
                                    } finally {
                                        if ($7.Fr(11297))
                                            continue jalangiLabel45;
                                        else
                                            return $7.Ra();
                                    }
                                }
                        }, 12)), 'find', false)($7.T(11041, '.configure_panel_text', 21)), 'html', false)($7.F(11061, $7.R(11049, 'getMessage', getMessage), false)($7.T(11053, 'exit', 21), $7.T(11057, 'Exit', 21)));
                        $7.M(11077, $7.R(11069, 'World', World), 'playSound', false)($7.T(11073, 'snd_theme', 21));
                    } catch ($7e) {
                        console.log($7e);
                        console.log($7e.stack);
                        throw $7e;
                    } finally {
                        if ($7.Fr(11301))
                            continue jalangiLabel46;
                        else
                            return $7.Ra();
                    }
                }
        }, 12));
    } catch ($7e) {
        console.log($7e);
        console.log($7e.stack);
        throw $7e;
    } finally {
        $7.Sr(11113);
    }
}
// JALANGI DO NOT INSTRUMENT

//@ sourceMappingURL=annex_jalangi_.js.map