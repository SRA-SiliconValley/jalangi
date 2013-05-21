if (typeof window ==="undefined") {
require("/Users/ksen/Dropbox/jalangi/src/analysis.js");
require("/Users/ksen/Dropbox/jalangi/src/InputManager.js");
require("/Users/ksen/Dropbox/jalangi/src/instrument.js");
require("/Users/ksen/Dropbox/jalangi/inputs.js");
}
try {
    J$.Se(965, "tests/unit/instrument-test_jalangi_.js");
    J$.N(969, "i", i, false);
    J$.N(973, "a", a, false);
    J$.N(981, "f1", J$.T(977, f1, 12), false);
    J$.N(985, "o", o, false);
    J$.N(989, "arr", arr, false);
    J$.N(993, "arr2", arr2, false);
    J$.N(997, "regex1", regex1, false);
    J$.N(1005, "Con", J$.T(1001, Con, 12), false);
    J$.N(1009, "c", c, false);
    J$.N(1017, "bar", J$.T(1013, bar, 12), false);
    J$.N(1025, "foo", J$.T(1021, foo, 12), false);
    J$.N(1033, "f3", J$.T(1029, f3, 12), false);
    J$.N(1037, "x", x, false);
    var i;
    var a = J$.W(25, "a", J$.T(21, [ J$.T(5, 1, 22), J$.T(9, 2, 22), J$.T(13, 3, 22), J$.T(17, 4, 22) ], 10));
    lbl1 : for (i = J$.W(33, "i", J$.T(29, 0, 22)); J$.C(8, J$.B(6, "<", J$.R(37, "i", i), J$.G(45, J$.R(41, "a", a), "length"))); J$.B(14, "-", i = J$.W(53, "i", J$.B(10, "+", J$.R(49, "i", i), 1)), 1)) {
        if (J$.C(4, J$.B(18, "===", J$.R(57, "i", i), J$.T(61, 0, 22)))) {
            continue;
        }
        J$.M(69, J$.I(typeof console === "undefined") ? J$.R(65, "console", undefined) : J$.R(65, "console", console), "log", false)(J$.G(81, J$.R(73, "a", a), J$.R(77, "i", i)));
    }
    function f1(j) {
        try {
            J$.Fe(245, arguments.callee);
            J$.N(249, "arguments", arguments, true);
            J$.N(253, "j", j, true);
            J$.N(261, "f2", J$.T(257, f2, 12), false);
            function f2(c) {
                try {
                    J$.Fe(189, arguments.callee);
                    J$.N(193, "arguments", arguments, true);
                    J$.N(197, "c", c, true);
                    J$.N(201, "sum", sum, false);
                    var sum = J$.W(89, "sum", J$.R(85, "c", c));
                    try {
                        sum = J$.W(101, "sum", J$.B(22, "*", J$.R(97, "sum", sum), J$.R(93, "j", j)));
                        if (J$.C(12, J$.B(26, ">", J$.R(105, "sum", sum), J$.T(109, 4, 22)))) {
                            sum = J$.W(117, "sum", J$.U(30, "-", J$.R(113, "sum", sum)));
                        }
                        i = J$.W(125, "i", J$.T(121, 0, 22));
                        while (J$.C(16, J$.B(34, "<", J$.R(129, "i", i), J$.R(133, "sum", sum)))) {
                            J$.M(141, J$.I(typeof console === "undefined") ? J$.R(137, "console", undefined) : J$.R(137, "console", console), "log", false)(J$.R(145, "i", i));
                            J$.B(42, "-", i = J$.W(153, "i", J$.B(38, "+", J$.R(149, "i", i), 1)), 1);
                        }
                        do {
                            J$.M(169, J$.I(typeof console === "undefined") ? J$.R(165, "console", undefined) : J$.R(165, "console", console), "log", false)(J$.R(173, "i", i));
                            J$.B(54, "+", i = J$.W(181, "i", J$.B(50, "-", J$.R(177, "i", i), 1)), 1);
                        } while (J$.C(20, J$.B(46, ">", J$.R(157, "i", i), J$.T(161, 0, 22))));
                    } finally {
                        return J$.R(185, "sum", sum);
                    }
                } catch (J$e) {
                    console.log(J$e);
                    console.log(J$e.stack);
                    throw J$e;
                } finally {
                    J$.Fr(205);
                }
            }
            return J$.T(241, function(i) {
                try {
                    J$.Fe(225, arguments.callee);
                    J$.N(229, "arguments", arguments, true);
                    J$.N(233, "i", i, true);
                    return J$.B(58, "+", J$.R(209, "j", j), J$.F(217, J$.R(213, "f2", f2), false)(J$.R(221, "i", i)));
                } catch (J$e) {
                    console.log(J$e);
                    console.log(J$e.stack);
                    throw J$e;
                } finally {
                    J$.Fr(237);
                }
            }, 12);
        } catch (J$e) {
            console.log(J$e);
            console.log(J$e.stack);
            throw J$e;
        } finally {
            J$.Fr(265);
        }
    }
    var o = J$.W(325, "o", J$.T(321, {
        x: J$.T(269, 1, 22),
        f1: J$.T(313, function() {
            try {
                J$.Fe(301, arguments.callee);
                J$.N(305, "arguments", arguments, true);
                J$.A(281, J$.R(273, "this", this), "x", "+")(J$.T(277, 5, 22));
                J$.A(297, J$.R(285, "this", this), J$.R(289, "x", x), "-")(J$.T(293, 4, 22));
            } catch (J$e) {
                console.log(J$e);
                console.log(J$e.stack);
                throw J$e;
            } finally {
                J$.Fr(309);
            }
        }, 12),
        del: J$.T(317, 5, 22)
    }, 11));
    J$.M(333, J$.R(329, "o", o), "f1", false)();
    delete J$.R(337, "o", o).del;
    J$.M(345, J$.I(typeof console === "undefined") ? J$.R(341, "console", undefined) : J$.R(341, "console", console), "log", false)(J$.F(361, J$.F(353, J$.R(349, "f1", f1), false)(J$.T(357, 3, 22)), false)(J$.T(365, 5, 22)));
    var arr = J$.W(393, "arr", J$.T(389, J$.F(373, J$.I(typeof Array === "undefined") ? J$.R(369, "Array", undefined) : J$.R(369, "Array", Array), true)(J$.T(377, "a", 21), J$.T(381, "b", 21), J$.T(385, "c", 21)), 11));
    var arr2 = J$.W(413, "arr2", J$.T(409, [ J$.T(397, "a", 21), J$.R(401, "i", i), J$.R(405, "o", o) ], 10));
    var regex1 = J$.W(421, "regex1", J$.T(417, /Hello/ig, 14));
    for (i in J$.H(429, J$.R(425, "arr", arr))) if (J$.C(24, J$.B(62, "!==", i, "*J$*"))) {
        J$.W(433, "i", i);
        {
            J$.M(441, J$.I(typeof console === "undefined") ? J$.R(437, "console", undefined) : J$.R(437, "console", console), "log", false)(J$.R(445, "i", i));
            J$.M(453, J$.I(typeof console === "undefined") ? J$.R(449, "console", undefined) : J$.R(449, "console", console), "log", false)(J$.G(465, J$.R(457, "arr", arr), J$.R(461, "i", i)));
        }
    }
    function Con() {
        try {
            J$.Fe(521, arguments.callee);
            J$.N(525, "arguments", arguments, true);
            J$.P(477, J$.R(469, "this", this), "x", J$.T(473, 1, 22));
            J$.P(517, J$.R(481, "this", this), "f1", J$.T(513, function() {
                try {
                    J$.Fe(501, arguments.callee);
                    J$.N(505, "arguments", arguments, true);
                    J$.A(489, J$.R(485, "this", this), "x", "+")(1);
                    J$.A(497, J$.R(493, "this", this), "x", "-")(1);
                } catch (J$e) {
                    console.log(J$e);
                    console.log(J$e.stack);
                    throw J$e;
                } finally {
                    J$.Fr(509);
                }
            }, 12));
        } catch (J$e) {
            console.log(J$e);
            console.log(J$e.stack);
            throw J$e;
        } finally {
            J$.Fr(529);
        }
    }
    o = J$.W(537, "o", J$.T(533, null, 25));
    if (J$.C(28, J$.B(70, "===", J$.U(66, "typeof", J$.R(541, "o", o)), J$.T(545, "object", 21)))) {
        J$.M(553, J$.I(typeof console === "undefined") ? J$.R(549, "console", undefined) : J$.R(549, "console", console), "log", false)(J$.T(557, "o is null", 21));
    }
    o = J$.W(565, "o", J$.T(561, {}, 11));
    J$.P(581, J$.R(569, "o", o), J$.T(573, "C", 21), J$.R(577, "Con", Con));
    var c = J$.W(597, "c", J$.T(593, J$.F(589, J$.R(585, "Con", Con), true)(), 11));
    J$.M(609, J$.R(601, "c", c), J$.T(605, "f1", 21), false)();
    J$.M(617, J$.I(typeof console === "undefined") ? J$.R(613, "console", undefined) : J$.R(613, "console", console), "log", false)(J$.G(625, J$.R(621, "c", c), "x"));
    c = J$.W(641, "c", J$.T(637, J$.M(633, J$.R(629, "o", o), "C", true)(), 11));
    J$.M(649, J$.R(645, "c", c), "f1", false)();
    J$.M(657, J$.I(typeof console === "undefined") ? J$.R(653, "console", undefined) : J$.R(653, "console", console), "log", false)(J$.G(665, J$.R(661, "c", c), "x"));
    x = J$.W(673, "x", J$.T(669, "global", 21));
    function bar(s) {
        try {
            J$.Fe(689, arguments.callee);
            J$.N(693, "arguments", arguments, true);
            J$.N(697, "s", s, true);
            J$.M(681, J$.I(typeof console === "undefined") ? J$.R(677, "console", undefined) : J$.R(677, "console", console), "log", false)(J$.R(685, "s", s));
        } catch (J$e) {
            console.log(J$e);
            console.log(J$e.stack);
            throw J$e;
        } finally {
            J$.Fr(701);
        }
    }
    function foo() {
        try {
            J$.Fe(729, arguments.callee);
            J$.N(733, "arguments", arguments, true);
            J$.N(737, "x", x, false);
            J$.N(741, "e", e, false);
            var x = J$.W(709, "x", J$.T(705, "local", 21));
            var e = J$.W(713, "e", eval);
            eval = J$.W(721, "eval", J$.R(717, "e", e));
            eval(J$.instrumentCode(J$.getConcrete(J$.T(725, "console.log(x);", 21)), true));
        } catch (J$e) {
            console.log(J$e);
            console.log(J$e.stack);
            throw J$e;
        } finally {
            J$.Fr(745);
        }
    }
    J$.F(753, J$.R(749, "foo", foo), false)();
    function f3(a, b, c) {
        try {
            J$.Fe(857, arguments.callee);
            J$.N(861, "arguments", arguments, true);
            J$.N(865, "a", a, true);
            J$.N(869, "b", b, true);
            J$.N(873, "c", c, true);
            J$.N(877, "ret", ret, false);
            var ret = J$.W(761, "ret", J$.T(757, null, 25));
            try {
                ret = J$.W(773, "ret", J$.M(769, J$.R(765, "c", c), "f1", false)()), J$.C(40, J$.C(36, J$.C(32, J$.R(777, "a", a)) ? J$.R(781, "b", b) : J$._()) ? J$._() : J$.R(785, "c", c)) ? J$.R(789, "a", a) : J$.R(793, "b", b);
                throw J$.T(809, J$.F(801, J$.I(typeof Error === "undefined") ? J$.R(797, "Error", undefined) : J$.R(797, "Error", Error), true)(J$.T(805, "Test", 21)), 11);
            } catch (e) {
                J$.M(817, J$.I(typeof console === "undefined") ? J$.R(813, "console", undefined) : J$.R(813, "console", console), "log", false)(J$.T(821, "f1 is undefined", 21));
            } finally {
                return J$.R(825, "ret", ret);
            }
            try {
                throw J$.T(841, J$.F(833, J$.I(typeof Error === "undefined") ? J$.R(829, "Error", undefined) : J$.R(829, "Error", Error), true)(J$.T(837, "Test2", 21)), 11);
            } catch (e) {
                J$.M(849, J$.I(typeof console === "undefined") ? J$.R(845, "console", undefined) : J$.R(845, "console", console), "log", false)(J$.R(853, "e", e));
            }
        } catch (J$e) {
            console.log(J$e);
            console.log(J$e.stack);
            throw J$e;
        } finally {
            J$.Fr(881);
        }
    }
    J$.F(889, J$.R(885, "f3", f3), false)(J$.T(893, true, 23), J$.T(897, false, 23), J$.T(901, true, 23));
    var x = J$.W(909, "x", J$.T(905, "1", 21));
    switch (J$.C1(44, J$.R(913, "x", x))) {
      case J$.C2(48, J$.T(917, "2", 21)):
      case J$.C2(52, J$.T(921, "3", 21)):
        J$.M(929, J$.I(typeof console === "undefined") ? J$.R(925, "console", undefined) : J$.R(925, "console", console), "log", false)(J$.T(933, "x > 1", 21));
        break;
      case J$.C2(56, J$.T(937, "1", 21)):
        J$.M(945, J$.I(typeof console === "undefined") ? J$.R(941, "console", undefined) : J$.R(941, "console", console), "log", false)(J$.T(949, "x === 1", 21));
        break;
      default:
        J$.M(957, J$.I(typeof console === "undefined") ? J$.R(953, "console", undefined) : J$.R(953, "console", console), "log", false)(J$.T(961, "x not in {1, 2 , 3}", 21));
    }
} catch (J$e) {
    console.log(J$e);
    console.log(J$e.stack);
    throw J$e;
} finally {
    J$.Sr(1041);
}
// JALANGI DO NOT INSTRUMENT
