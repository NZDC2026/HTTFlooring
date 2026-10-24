using Htt.SharedKernel;

namespace Htt.Modules.Foundation;

public record LineAmounts(decimal Net, decimal Tax, decimal Gross);
public record PackQuantity(decimal RequestedArea, decimal Packs, decimal CoveredArea);

public static class Calculations
{
    public static decimal RoundMoney(decimal amount) => decimal.Round(amount, 2, MidpointRounding.AwayFromZero);

    // The rounding policy belongs to the server and is snapshotted on future documents.
    public static LineAmounts Tax(decimal amount, decimal rate, bool inclusive)
    {
        if (amount < 0 || rate is < 0 or > 1)
            throw new BusinessException("invalid_tax_input", "Amount and rate are outside the supported range.");
        var gross = inclusive ? RoundMoney(amount) : 0;
        var net = inclusive ? RoundMoney(gross / (1 + rate)) : RoundMoney(amount);
        var tax = inclusive ? gross - net : RoundMoney(net * rate);
        return new(net, tax, net + tax);
    }

    public static PackQuantity WholePacks(decimal requestedArea, decimal areaPerPack)
    {
        if (requestedArea <= 0 || areaPerPack <= 0)
            throw new BusinessException("invalid_quantity", "Area and conversion must be positive.");
        var packs = decimal.Ceiling(requestedArea / areaPerPack);
        return new(requestedArea, packs, packs * areaPerPack);
    }
}
