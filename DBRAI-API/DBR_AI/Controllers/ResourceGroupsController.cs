using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using DBR_AI.DataLayer; // your LINQ-to-SQL DataContext (ParametersDataModelDataContext)

namespace DBR_AI.Controllers
{
    [RoutePrefix("api/resource-groups")]
    public class ResourceGroupsController : ApiController
    {
        /// <summary>
        /// Returns the distinct list of resource groups, reflecting other users' adds/deletes.
        /// Combines scheduled resources + any groups found in calendars, deduped & sorted.
        /// </summary>
        [HttpGet, Route("")]
        public IHttpActionResult GetAll()
        {
            try
            {
                using (var ctx = new ParametersDataModelDataContext())
                {
                    // From master table
                    var fromScheduled =
                        ctx.ocx_param_scheduled_resources
                           .Select(r => r.resource_group)
                           .Where(g => g != null && g != "")
                           .Distinct();

                    // Also include any group keys that exist only in calendars (just in case)
                    var fromCalendars =
                        ctx.ocx_param_resource_calendars
                           .Select(c => c.resource)
                           .Where(g => g != null && g != "")
                           .Distinct();

                    var groups =
                        fromScheduled
                        .Union(fromCalendars)
                        .Distinct()
                        .OrderBy(g => g)
                        .ToList();

                    return Ok(groups);
                }
            }
            catch (Exception ex)
            {
                // Keep it simple; you can log ex if you have logging
                return InternalServerError(ex);
            }
        }
    }
}
