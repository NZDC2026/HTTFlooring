namespace Htt.SharedKernel;

public static class AustralianBusinessNumber
{
    private static readonly int[] Weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

    public static string Normalize(string input)
    {
        var value = input.Replace(" ", "", StringComparison.Ordinal);
        if (value.Length != 11 || value.Any(c => c is < '0' or > '9'))
            throw new BusinessException("invalid_abn", "ABN must contain 11 ASCII digits.");
        var sum = -10;
        for (var i = 0; i < value.Length; i++) sum += (value[i] - '0') * Weights[i];
        if (sum % 89 != 0 || value[0] == '0')
            throw new BusinessException("invalid_abn", "ABN checksum is invalid.");
        return value;
    }
}
