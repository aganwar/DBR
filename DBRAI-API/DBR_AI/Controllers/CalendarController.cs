using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Description;
using DBR_AI.DataLayer;
using DBR_AI.Models;

namespace DBR_AI.Controllers
{
    [RoutePrefix("api/calendar")]
    public class CalendarController : ApiController
    {
        // GET /api/calendar/{resource}?from=YYYY-MM-DD&to=YYYY-MM-DD
        [HttpGet, Route("{resource}")]
        [ResponseType(typeof(IEnumerable<CalendarRowDto>))]
        public IHttpActionResult Get(string resource, string from = null, string to = null)
        {
            if (string.IsNullOrWhiteSpace(resource))
                return BadRequest("resource is required");

            DateTime? fromDate = ParseYmd(from);
            DateTime? toDate = ParseYmd(to);

            using (var db = new ParametersDataModelDataContext())
            {
                var q = db.vw_ocx_param_resource_calendar_edits.Where(v => v.resource == resource);
                if (fromDate.HasValue) q = q.Where(v => v.dates >= fromDate.Value);
                if (toDate.HasValue) q = q.Where(v => v.dates <= toDate.Value);

                var rows = q.OrderBy(v => v.dates)
                     .AsEnumerable() // switch to client-side
                     .Select(v => new CalendarRowDto
                     {
                         dates = v.dates.ToString("yyyy-MM-dd"),        // safe now (client-side)
                        resource = v.resource,
                         capacity = v.working_hours.HasValue
                                            ? (int?)Convert.ToInt32(v.working_hours.Value)
                                            : (int?)null,
                         is_off = v.is_off,
                         is_customised = v.is_customised
                     })
                     .ToList();

                return Ok(rows);
            }
        }

        // PATCH /api/calendar/{resource}
        // body: { "changesByDate": { "2025-08-01": { "capacity": 0 }, "2025-08-02": { "capacity": 8 } } }
        [HttpPatch, Route("{resource}")]
        public IHttpActionResult Patch(string resource, [FromBody] CalendarPatchDto patch)
        {
            if (string.IsNullOrWhiteSpace(resource))
                return BadRequest("resource is required");
            if (patch == null || patch.changesByDate == null || patch.changesByDate.Count == 0)
                return Ok(); // nothing to do

            foreach (var kv in patch.changesByDate)
            {
                var ymd = kv.Key;
                var vals = kv.Value ?? new Dictionary<string, object>();
                var date = ParseYmd(ymd);
                if (!date.HasValue) continue;

                var values = new Dictionary<string, object>
                {
                    ["resource"] = resource,
                    ["dates"] = date.Value
                };

                foreach (var f in vals) values[f.Key] = f.Value;

                // DAL handles: working_hours int?, is_off set true when hours==0, mark is_customised
                ParametersDataModelDataAccess.UpdateDBRScheduleResourceCalendarParameters(values, User?.Identity?.Name ?? "api");
            }
            return Ok();
        }

        private static DateTime? ParseYmd(string ymd)
        {
            if (string.IsNullOrWhiteSpace(ymd)) return null;
            DateTime d;
            return DateTime.TryParseExact(ymd, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out d)
                ? d : (DateTime?)null;
        }
    }
}
