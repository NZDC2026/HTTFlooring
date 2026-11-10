using Htt.Modules.Foundation;
using Htt.SharedKernel;
using Xunit;

namespace Htt.UnitTests;

public sealed class CalculationTests
{
    [Theory]
    [InlineData("100", false, "100", "10", "110")]
    [InlineData("110", true, "100", "10", "110")]
    [InlineData("0.05", false, "0.05", "0.01", "0.06")]
    [InlineData("0", true, "0", "0", "0")]
    public void Australian_tax_rounding_reconciles(string input, bool inclusive, string net, string tax, string total)
    {
        static decimal D(string v) => decimal.Parse(v, System.Globalization.CultureInfo.InvariantCulture);
        var actual = Calculations.Tax(D(input), 0.1m, inclusive);
        Assert.Equal(new LineAmounts(D(net), D(tax), D(total)), actual);
        Assert.Equal(actual.Gross, actual.Net + actual.Tax);
    }

    [Fact]
    public void Pack_conversion_never_under_supplies_requested_area()
    {
        Assert.Equal(new PackQuantity(50m, 23m, 50.6m), Calculations.WholePacks(50m, 2.2m));
        Assert.Equal(23m, Calculations.WholePacks(50.6m, 2.2m).Packs);
        Assert.Equal(24m, Calculations.WholePacks(50.600001m, 2.2m).Packs);
        Assert.Throws<BusinessException>(() => Calculations.WholePacks(1, 0));
    }

    [Theory]
    [InlineData("51 824 753 556", "51824753556")]
    [InlineData("53004085616", "53004085616")]
    public void Abn_validates_checksum_and_preserves_identifier(string input, string expected)
        => Assert.Equal(expected, AustralianBusinessNumber.Normalize(input));

    [Theory]
    [InlineData("51824753557")]
    [InlineData("00000000000")]
    [InlineData("５１８２４７５３５５６")]
    [InlineData("123")]
    public void Invalid_abn_rejected(string input) => Assert.Throws<BusinessException>(() => AustralianBusinessNumber.Normalize(input));
}
