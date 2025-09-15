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
    [RoutePrefix("api/resources")]
    public class ResourcesController : ApiController
    {
        // GET /api/resources?groups=RG1;RG2
        [HttpGet, Route("")]
        [ResponseType(typeof(IEnumerable<ResourceDto>))]
        public IHttpActionResult Get(string groups)
        {
            var selected = (groups ?? string.Empty)
                .Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .ToArray();
            if (selected.Length == 0) return Ok(Enumerable.Empty<ResourceDto>());

            using (var db = new ParametersDataModelDataContext())
            {
                // Use the *view* your page used for reading
                var query = db.vw_ocx_param_scheduled_resource_edits
                              .Where(v => selected.Contains(v.resource_group))
                              .Select(v => new ResourceDto
                              {
                                  resource_group = v.resource_group,
                                  is_constraint = v.is_constraint,
                                  capacity = v.capacity
                              });

                return Ok(query.ToList());
            }
        }

        // POST /api/resources
        [HttpPost, Route("")]
        public IHttpActionResult Post([FromBody] ResourceDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.resource_group))
                return BadRequest("resource_group is required");

            var values = new Dictionary<string, object>
            {
                ["resource_group"] = dto.resource_group,
                ["is_constraint"] = dto.is_constraint,
                ["capacity"] = dto.capacity
            };

            ParametersDataModelDataAccess.InsertDBRScheduleResourceParameters(values);

            // NOTE: if you want to call the SP from DAL, uncomment there.
            return Ok();
        }

        // PATCH /api/resources
        // body: [{ "id":"RES-GRP-100", "changes": { "capacity": 12, "is_constraint": true } }]
        [HttpPatch, Route("")]
        public IHttpActionResult Patch([FromBody] List<ResourcePatchItem> items)
        {
            if (items == null || items.Count == 0) return Ok();

            foreach (var it in items)
            {
                if (string.IsNullOrWhiteSpace(it.id)) continue;

                var values = new Dictionary<string, object> { ["resource_group"] = it.id };
                if (it.changes != null)
                    foreach (var kv in it.changes) values[kv.Key] = kv.Value;

                ParametersDataModelDataAccess.UpdateDBRScheduleResourceParameters(values, User?.Identity?.Name ?? "api");
            }
            return Ok();
        }

        // DELETE /api/resources
        // body: ["RES-GRP-100","RES-GRP-200"]
        [HttpDelete, Route("")]
        public IHttpActionResult Delete([FromBody] List<string> ids)
        {
            if (ids == null || ids.Count == 0) return Ok();
            foreach (var id in ids.Where(s => !string.IsNullOrWhiteSpace(s)))
                ParametersDataModelDataAccess.DBRDeleteScheduleResources(id);
            return Ok();
        }
    }
}
