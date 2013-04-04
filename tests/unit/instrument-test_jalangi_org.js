if (typeof window ==="undefined") {
require("/Users/ksen/Dropbox/jalangi/src/analysis.js");
require("/Users/ksen/Dropbox/jalangi/src/InputManager.js");
require("/Users/ksen/Dropbox/jalangi/src/instrument.js");
require("/Users/ksen/Dropbox/jalangi/inputs.js");
}
try {
    $7.Se(965, "tests/unit/instrument-test_jalangi_.js");
    $7.N(969, "i", i, false);
    $7.N(973, "a", a, false);
    $7.N(981, "f1", $7.T(977, f1, 12), false);
    $7.N(985, "o", o, false);
    $7.N(989, "arr", arr, false);
    $7.N(993, "arr2", arr2, false);
    $7.N(997, "regex1", regex1, false);
    $7.N(1005, "Con", $7.T(1001, Con, 12), false);
    $7.N(1009, "c", c, false);
    $7.N(1017, "bar", $7.T(1013, bar, 12), false);
    $7.N(1025, "foo", $7.T(1021, foo, 12), false);
    $7.N(1033, "f3", $7.T(1029, f3, 12), false);
    $7.N(1037, "x", x, false);
    var i;
    var a = $7.W(25, "a", $7.T(21, [ $7.T(5, 1, 22), $7.T(9, 2, 22), $7.T(13, 3, 22), $7.T(17, 4, 22) ], 10));
    lbl1 : for (i = $7.W(33, "i", $7.T(29, 0, 22)); $7.C(8, $7.B(6, "<", $7.R(37, "i", i), $7.G(45, $7.R(41, "a", a), "length"))); $7.B(14, "-", i = $7.W(53, "i", $7.B(10, "+", $7.R(49, "i", i), 1)), 1)) {
        if ($7.C(4, $7.B(18, "===", $7.R(57, "i", i), $7.T(61, 0, 22)))) {
            continue;
        }
        $7.M(69, $7.I(typeof console === "undefined") ? $7.R(65, "console", undefined) : $7.R(65, "console", console), "log", false)($7.G(81, $7.R(73, "a", a), $7.R(77, "i", i)));
    }
    function f1(j) {
        try {
            $7.Fe(245, arguments.callee);
            $7.N(249, "arguments", arguments, true);
            $7.N(253, "j", j, true);
            $7.N(261, "f2", $7.T(257, f2, 12), false);
            function f2(c) {
                try {
                    $7.Fe(189, arguments.callee);
                    $7.N(193, "arguments", arguments, true);
                    $7.N(197, "c", c, true);
                    $7.N(201, "sum", sum, false);
                    var sum = $7.W(89, "sum", $7.R(85, "c", c));
                    try {
                        sum = $7.W(101, "sum", $7.B(22, "*", $7.R(97, "sum", sum), $7.R(93, "j", j)));
                        if ($7.C(12, $7.B(26, ">", $7.R(105, "sum", sum), $7.T(109, 4, 22)))) {
                            sum = $7.W(117, "sum", $7.U(30, "-", $7.R(113, "sum", sum)));
                        }
                        i = $7.W(125, "i", $7.T(121, 0, 22));
                        while ($7.C(16, $7.B(34, "<", $7.R(129, "i", i), $7.R(133, "sum", sum)))) {
                            $7.M(141, $7.I(typeof console === "undefined") ? $7.R(137, "console", undefined) : $7.R(137, "console", console), "log", false)($7.R(145, "i", i));
                            $7.B(42, "-", i = $7.W(153, "i", $7.B(38, "+", $7.R(149, "i", i), 1)), 1);
                        }
                        do {
                            $7.M(169, $7.I(typeof console === "undefined") ? $7.R(165, "console", undefined) : $7.R(165, "console", console), "log", false)($7.R(173, "i", i));
                            $7.B(54, "+", i = $7.W(181, "i", $7.B(50, "-", $7.R(177, "i", i), 1)), 1);
                        } while ($7.C(20, $7.B(46, ">", $7.R(157, "i", i), $7.T(161, 0, 22))));
                    } finally {
                        return $7.R(185, "sum", sum);
                    }
                } catch ($7e) {
                    console.log($7e);
                    console.log($7e.stack);
                    throw $7e;
                } finally {
                    $7.Fr(205);
                }
            }
            return $7.T(241, function(i) {
                try {
                    $7.Fe(225, arguments.callee);
                    $7.N(229, "arguments", arguments, true);
                    $7.N(233, "i", i, true);
                    return $7.B(58, "+", $7.R(209, "j", j), $7.F(217, $7.R(213, "f2", f2), false)($7.R(221, "i", i)));
                } catch ($7e) {
                    console.log($7e);
                    console.log($7e.stack);
                    throw $7e;
                } finally {
                    $7.Fr(237);
                }
            }, 12);
        } catch ($7e) {
            console.log($7e);
            console.log($7e.stack);
            throw $7e;
        } finally {
            $7.Fr(265);
        }
    }
    var o = $7.W(325, "o", $7.T(321, {
        x: $7.T(269, 1, 22),
        f1: $7.T(313, function() {
            try {
                $7.Fe(301, arguments.callee);
                $7.N(305, "arguments", arguments, true);
                $7.A(281, $7.R(273, "this", this), "x", "+")($7.T(277, 5, 22));
                $7.A(297, $7.R(285, "this", this), $7.R(289, "x", x), "-")($7.T(293, 4, 22));
            } catch ($7e) {
                console.log($7e);
                console.log($7e.stack);
                throw $7e;
            } finally {
                $7.Fr(309);
            }
        }, 12),
        del: $7.T(317, 5, 22)
    }, 11));
    $7.M(333, $7.R(329, "o", o), "f1", false)();
    delete $7.R(337, "o", o).del;
    $7.M(345, $7.I(typeof console === "undefined") ? $7.R(341, "console", undefined) : $7.R(341, "console", console), "log", false)($7.F(361, $7.F(353, $7.R(349, "f1", f1), false)($7.T(357, 3, 22)), false)($7.T(365, 5, 22)));
    var arr = $7.W(393, "arr", $7.T(389, $7.F(373, $7.I(typeof Array === "undefined") ? $7.R(369, "Array", undefined) : $7.R(369, "Array", Array), true)($7.T(377, "a", 21), $7.T(381, "b", 21), $7.T(385, "c", 21)), 11));
    var arr2 = $7.W(413, "arr2", $7.T(409, [ $7.T(397, "a", 21), $7.R(401, "i", i), $7.R(405, "o", o) ], 10));
    var regex1 = $7.W(421, "regex1", $7.T(417, /Hello/ig, 14));
    for (i in $7.H(429, $7.R(425, "arr", arr))) if ($7.C(24, $7.B(62, "!==", i, "*$7*"))) {
        $7.W(433, "i", i);
        {
            $7.M(441, $7.I(typeof console === "undefined") ? $7.R(437, "console", undefined) : $7.R(437, "console", console), "log", false)($7.R(445, "i", i));
            $7.M(453, $7.I(typeof console === "undefined") ? $7.R(449, "console", undefined) : $7.R(449, "console", console), "log", false)($7.G(465, $7.R(457, "arr", arr), $7.R(461, "i", i)));
        }
    }
    function Con() {
        try {
            $7.Fe(521, arguments.callee);
            $7.N(525, "arguments", arguments, true);
            $7.P(477, $7.R(469, "this", this), "x", $7.T(473, 1, 22));
            $7.P(517, $7.R(481, "this", this), "f1", $7.T(513, function() {
                try {
                    $7.Fe(501, arguments.callee);
                    $7.N(505, "arguments", arguments, true);
                    $7.A(489, $7.R(485, "this", this), "x", "+")(1);
                    $7.A(497, $7.R(493, "this", this), "x", "-")(1);
                } catch ($7e) {
                    console.log($7e);
                    console.log($7e.stack);
                    throw $7e;
                } finally {
                    $7.Fr(509);
                }
            }, 12));
        } catch ($7e) {
            console.log($7e);
            console.log($7e.stack);
            throw $7e;
        } finally {
            $7.Fr(529);
        }
    }
    o = $7.W(537, "o", $7.T(533, null, 25));
    if ($7.C(28, $7.B(70, "===", $7.U(66, "typeof", $7.R(541, "o", o)), $7.T(545, "object", 21)))) {
        $7.M(553, $7.I(typeof console === "undefined") ? $7.R(549, "console", undefined) : $7.R(549, "console", console), "log", false)($7.T(557, "o is null", 21));
    }
    o = $7.W(565, "o", $7.T(561, {}, 11));
    $7.P(581, $7.R(569, "o", o), $7.T(573, "C", 21), $7.R(577, "Con", Con));
    var c = $7.W(597, "c", $7.T(593, $7.F(589, $7.R(585, "Con", Con), true)(), 11));
    $7.M(609, $7.R(601, "c", c), $7.T(605, "f1", 21), false)();
    $7.M(617, $7.I(typeof console === "undefined") ? $7.R(613, "console", undefined) : $7.R(613, "console", console), "log", false)($7.G(625, $7.R(621, "c", c), "x"));
    c = $7.W(641, "c", $7.T(637, $7.M(633, $7.R(629, "o", o), "C", true)(), 11));
    $7.M(649, $7.R(645, "c", c), "f1", false)();
    $7.M(657, $7.I(typeof console === "undefined") ? $7.R(653, "console", undefined) : $7.R(653, "console", console), "log", false)($7.G(665, $7.R(661, "c", c), "x"));
    x = $7.W(673, "x", $7.T(669, "global", 21));
    function bar(s) {
        try {
            $7.Fe(689, arguments.callee);
            $7.N(693, "arguments", arguments, true);
            $7.N(697, "s", s, true);
            $7.M(681, $7.I(typeof console === "undefined") ? $7.R(677, "console", undefined) : $7.R(677, "console", console), "log", false)($7.R(685, "s", s));
        } catch ($7e) {
            console.log($7e);
            console.log($7e.stack);
            throw $7e;
        } finally {
            $7.Fr(701);
        }
    }
    function foo() {
        try {
            $7.Fe(729, arguments.callee);
            $7.N(733, "arguments", arguments, true);
            $7.N(737, "x", x, false);
            $7.N(741, "e", e, false);
            var x = $7.W(709, "x", $7.T(705, "local", 21));
            var e = $7.W(713, "e", eval);
            eval = $7.W(721, "eval", $7.R(717, "e", e));
            eval($7.instrumentCode($7.getConcrete($7.T(725, "console.log(x);", 21)), true));
        } catch ($7e) {
            console.log($7e);
            console.log($7e.stack);
            throw $7e;
        } finally {
            $7.Fr(745);
        }
    }
    $7.F(753, $7.R(749, "foo", foo), false)();
    function f3(a, b, c) {
        try {
            $7.Fe(857, arguments.callee);
            $7.N(861, "arguments", arguments, true);
            $7.N(865, "a", a, true);
            $7.N(869, "b", b, true);
            $7.N(873, "c", c, true);
            $7.N(877, "ret", ret, false);
            var ret = $7.W(761, "ret", $7.T(757, null, 25));
            try {
                ret = $7.W(773, "ret", $7.M(769, $7.R(765, "c", c), "f1", false)()), $7.C(40, $7.C(36, $7.C(32, $7.R(777, "a", a)) ? $7.R(781, "b", b) : $7._()) ? $7._() : $7.R(785, "c", c)) ? $7.R(789, "a", a) : $7.R(793, "b", b);
                throw $7.T(809, $7.F(801, $7.I(typeof Error === "undefined") ? $7.R(797, "Error", undefined) : $7.R(797, "Error", Error), true)($7.T(805, "Test", 21)), 11);
            } catch (e) {
                $7.M(817, $7.I(typeof console === "undefined") ? $7.R(813, "console", undefined) : $7.R(813, "console", console), "log", false)($7.T(821, "f1 is undefined", 21));
            } finally {
                return $7.R(825, "ret", ret);
            }
            try {
                throw $7.T(841, $7.F(833, $7.I(typeof Error === "undefined") ? $7.R(829, "Error", undefined) : $7.R(829, "Error", Error), true)($7.T(837, "Test2", 21)), 11);
            } catch (e) {
                $7.M(849, $7.I(typeof console === "undefined") ? $7.R(845, "console", undefined) : $7.R(845, "console", console), "log", false)($7.R(853, "e", e));
            }
        } catch ($7e) {
            console.log($7e);
            console.log($7e.stack);
            throw $7e;
        } finally {
            $7.Fr(881);
        }
    }
    $7.F(889, $7.R(885, "f3", f3), false)($7.T(893, true, 23), $7.T(897, false, 23), $7.T(901, true, 23));
    var x = $7.W(909, "x", $7.T(905, "1", 21));
    switch ($7.C1(44, $7.R(913, "x", x))) {
      case $7.C2(48, $7.T(917, "2", 21)):
      case $7.C2(52, $7.T(921, "3", 21)):
        $7.M(929, $7.I(typeof console === "undefined") ? $7.R(925, "console", undefined) : $7.R(925, "console", console), "log", false)($7.T(933, "x > 1", 21));
        break;
      case $7.C2(56, $7.T(937, "1", 21)):
        $7.M(945, $7.I(typeof console === "undefined") ? $7.R(941, "console", undefined) : $7.R(941, "console", console), "log", false)($7.T(949, "x === 1", 21));
        break;
      default:
        $7.M(957, $7.I(typeof console === "undefined") ? $7.R(953, "console", undefined) : $7.R(953, "console", console), "log", false)($7.T(961, "x not in {1, 2 , 3}", 21));
    }
} catch ($7e) {
    console.log($7e);
    console.log($7e.stack);
    throw $7e;
} finally {
    $7.Sr(1041);
}
// JALANGI DO NOT INSTRUMENT
