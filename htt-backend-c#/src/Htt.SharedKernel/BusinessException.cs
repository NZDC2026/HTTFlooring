namespace Htt.SharedKernel;

public sealed class BusinessException(string code, string message, int statusCode = 422, IReadOnlyDictionary<string,string[]>? fieldErrors = null) : Exception(message)
{
    public string Code { get; } = code;
    public int StatusCode { get; } = statusCode;
    public IReadOnlyDictionary<string,string[]> FieldErrors { get; } = fieldErrors ?? new Dictionary<string,string[]>();
}
