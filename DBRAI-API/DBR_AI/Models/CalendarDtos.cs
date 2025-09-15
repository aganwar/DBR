using System.Collections.Generic;

namespace DBR_AI.Models
{
    public class CalendarRowDto
    {
        public string dates { get; set; }       // yyyy-MM-dd
        public string resource { get; set; }
        public int? capacity { get; set; }      // maps to working_hours (int?)
        public bool? is_off { get; set; }
        public bool? is_customised { get; set; }
    }

    public class CalendarPatchDto
    {
        // e.g. { "2025-08-01": { "capacity": 6 }, "2025-08-02": { "capacity": 0 } }
        public Dictionary<string, Dictionary<string, object>> changesByDate { get; set; }
    }
}
