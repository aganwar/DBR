namespace DBR_AI.Models
{
    public class ResourceDto
    {
        public string resource_group { get; set; }
        public bool? is_constraint { get; set; }
        public int? capacity { get; set; }   // int? to match your DBML
    }

    public class ResourcePatchItem
    {
        public string id { get; set; } // resource_group
        public System.Collections.Generic.Dictionary<string, object> changes { get; set; }
    }
}
