using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.Http;
using DBR_AI.Models;
using Newtonsoft.Json.Linq;

namespace DBR_AI.Controllers
{
    [RoutePrefix("api/grid-config")]
    public class GridConfigController : ApiController
    {
        // Accepts "scheduled-resources-master" or "scheduled-resources/master"
        [HttpGet, Route("{*gridKey}")]
        public IHttpActionResult Get(string gridKey)
        {
            // Normalize: allow slashes OR hyphens; forbid dots
            if (string.IsNullOrWhiteSpace(gridKey))
                return BadRequest("gridKey is required.");

            if (gridKey.Contains("."))
                return BadRequest("gridKey must not contain dots.");

            // collapse any multiple slashes, then convert slashes -> hyphens
            gridKey = Regex.Replace(gridKey.Trim(), "/+", "/").Trim('/');
            gridKey = gridKey.Replace("/", "-").ToLowerInvariant();

            try
            {
                var cs = ConfigurationManager.ConnectionStrings["StandardParametersConnectionString"]?.ConnectionString;
                if (string.IsNullOrWhiteSpace(cs))
                    return InternalServerError(new Exception("Missing connection string 'StandardParametersConnectionString'."));

                string json = null;
                using (var conn = new SqlConnection(cs))
                using (var cmd = new SqlCommand(@"
                    SELECT TOP 1 config_json
                    FROM dbo.app_grid_configs
                    WHERE grid_key = @k AND is_active = 1
                ", conn))
                {
                    cmd.Parameters.AddWithValue("@k", gridKey);
                    conn.Open();
                    json = cmd.ExecuteScalar() as string;
                }

                if (!string.IsNullOrWhiteSpace(json))
                    return Ok(ParseConfig(gridKey, json));

                // benign default if not found
                return Ok(new GridConfigDto
                {
                    gridKey = gridKey,
                    canWrite = true
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        private GridConfigDto ParseConfig(string gridKey, string json)
        {
            var dto = new GridConfigDto { gridKey = gridKey };
            var jo = string.IsNullOrWhiteSpace(json) ? new JObject() : JObject.Parse(json);

            dto.canWrite = jo["canWrite"]?.Value<bool?>() ?? true;

            var edit = jo["editableColumns"] as JArray;
            if (edit != null)
                dto.editableColumns = edit.Select(t => (string)t).Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList();

            var hidden = jo["hiddenColumns"] as JArray;
            if (hidden != null)
                dto.hiddenColumns = hidden.Select(t => (string)t).Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList();

            var opts = jo["columnOptions"] as JObject;
            if (opts != null)
                dto.columnOptions = opts.Properties().ToDictionary(p => p.Name, p => (object)p.Value);

            return dto;
        }
    }
}
