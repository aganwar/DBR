using System.Collections.Generic;

namespace DBR_AI.Models
{
    public class GridConfigDto
    {
        public string gridKey { get; set; }
        public bool canWrite { get; set; } = true;
        public List<string> editableColumns { get; set; } = new List<string>();
        public List<string> hiddenColumns { get; set; } = new List<string>();
        public Dictionary<string, object> columnOptions { get; set; } = new Dictionary<string, object>();
    }
}
