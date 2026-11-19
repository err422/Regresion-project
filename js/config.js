window.ProjectConfig = {
  CFG: {
      members: "Ashur Nichols",
      indep: "Blood alcohol concentration (BAC), in percent",
      dep: "Relative risk of a car accident (1 = sober baseline)",
      depShort: "relative crash risk",
      data: [
        [0, 1], [0.01, 1.03], [0.03, 1.06], [0.05, 1.38], [0.07, 2.09], [0.09, 3.54], [0.11, 6.41], [0.13, 12.6], [0.15, 22.1], [0.17, 39.05], [0.19, 65.32], [0.21, 99.78]
      ],
      px: 0.09,
      py: 5,
      errRow: 5,
      domain: "[0, 0.40]",
      range: "(0, \u221e)",
      domWhy: "BAC cannot be negative, and above about 0.40% it is often fatal, so x is limited to 0 \u2264 x \u2264 0.40. An exponential function a\u00b7b\u02e3 with a > 0 always outputs positive values, so risk is greater than 0 and, in theory, grows without bound."
    }
};
