using System.Net.Http.Formatting;
using System.Web.Http;
using System.Web.Http.Cors;
using Newtonsoft.Json.Serialization;

public static class WebApiConfig
{
    public static void Register(HttpConfiguration config)
    {
        // CORS (adjust origin/port if needed)
        config.EnableCors(new EnableCorsAttribute("http://localhost:5173", "*", "*"));

        // Routes
        config.MapHttpAttributeRoutes();
        config.Routes.MapHttpRoute(
            name: "DefaultApi",
            routeTemplate: "api/{controller}/{id}",
            defaults: new { id = RouteParameter.Optional }
        );

        // JSON only, camelCase
        var json = new JsonMediaTypeFormatter();
        json.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
        config.Formatters.Clear();
        config.Formatters.Add(json);
    }
}
