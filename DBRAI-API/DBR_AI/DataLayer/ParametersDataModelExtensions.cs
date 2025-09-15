using System;
using System.Configuration;
using System.Web;

namespace DBR_AI.DataLayer  // <-- must match designer's namespace
{
    public partial class ParametersDataModelDataContext
    {
        // Add a parameterless ctor so existing DAL code compiles:
        public ParametersDataModelDataContext()
            : this(ConfigurationManager.ConnectionStrings[
                "StandardParametersConnectionString"
            ].ConnectionString)
        {
            // base(...) will call OnCreated() automatically (generated code),
            // but we still call it indirectly through the generated constructor chain.
        }

        // Hardened OnCreated: safe null checks, optional settings.
        partial void OnCreated()
        {
            // Command timeout from appSettings (optional)
            var timeout = ConfigurationManager.AppSettings["LinqCommandTimeout"];
            if (!string.IsNullOrWhiteSpace(timeout) && int.TryParse(timeout, out var seconds))
            {
                this.CommandTimeout = seconds;
            }

            // Optional simulator mode:
            // use ?mode=simulator in the URL AND appSetting Simulator=1 to flip to Simulation connection
            bool simulatorEnabled = string.Equals(
                ConfigurationManager.AppSettings["Simulator"], "1", StringComparison.Ordinal);

            bool simulatorQuery =
                HttpContext.Current?.Request?.QueryString?["mode"] != null &&
                string.Equals(HttpContext.Current.Request.QueryString["mode"], "simulator",
                              StringComparison.OrdinalIgnoreCase);

            var csName = (simulatorEnabled && simulatorQuery)
                ? "SimulationParametersConnectionString"
                : "StandardParametersConnectionString";

            var cs = ConfigurationManager.ConnectionStrings[csName]?.ConnectionString;
            if (!string.IsNullOrWhiteSpace(cs))
            {
                // If the generated ctor already set a value, we can safely override here.
                this.Connection.ConnectionString = cs;
            }
        }
    }
}
