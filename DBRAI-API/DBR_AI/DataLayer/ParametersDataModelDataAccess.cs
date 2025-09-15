using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Linq;
using System.Globalization;
using System.Linq;
using System.Transactions;

namespace DBR_AI.DataLayer
{
    // Optional helper you already had in this file
    public static class ListExtensions
    {
        public static List<List<T>> ChunkBy<T>(this List<T> source, int chunkSize)
        {
            return source
                .Select((x, i) => new { Index = i, Value = x })
                .GroupBy(x => x.Index / chunkSize)
                .Select(x => x.Select(v => v.Value).ToList())
                .ToList();
        }
    }

    public class ParametersDataModelDataAccess
    {
        // -----------------------
        // Generic conversion helpers
        // -----------------------
        private static object ConvertTo(object value, Type targetType)
        {
            if (value == null || value is DBNull) return null;
            var t = Nullable.GetUnderlyingType(targetType) ?? targetType;

            // already assignable
            if (t.IsInstanceOfType(value)) return value;

            // support strings for dates/decimals/bools/ints
            if (t == typeof(DateTime) && value is string sdt)
                return DateTime.Parse(sdt, CultureInfo.InvariantCulture);
            if (t == typeof(decimal) && value is string sdc)
                return decimal.Parse(sdc, CultureInfo.InvariantCulture);
            if (t == typeof(int) && value is string sint)
                return int.Parse(sint, CultureInfo.InvariantCulture);
            if (t == typeof(bool) && value is string sb)
                return bool.Parse(sb);

            return Convert.ChangeType(value, t, CultureInfo.InvariantCulture);
        }

        private static int? ToNullableInt(object v)
        {
            if (v == null || v is DBNull) return null;
            var d = Convert.ToDecimal(v, CultureInfo.InvariantCulture);
            return (int)Math.Round(d, 0, MidpointRounding.AwayFromZero);
        }

        public static void WriteValuesToRow(object item, Dictionary<string, object> values)
        {
            foreach (var kv in values)
            {
                var prop = item.GetType().GetProperty(kv.Key);
                if (prop == null || !prop.CanWrite) continue;
                var converted = ConvertTo(kv.Value, prop.PropertyType);
                prop.SetValue(item, converted, null);
            }
        }

        // ====================================================
        // MASTER (Filter result grid) – ocx_param_scheduled_resources
        // ====================================================

        internal static void UpdateDBRScheduleResourceParameters(Dictionary<string, object> values, string name)
        {
            using (var context = new ParametersDataModelDataContext())
            {
                var id = values.ContainsKey("resource_group") ? Convert.ToString(values["resource_group"]) : null;
                if (string.IsNullOrWhiteSpace(id)) return;

                var row = context.ocx_param_scheduled_resources.SingleOrDefault(x => x.resource_group == id);
                if (row == null) return;

                if (values.ContainsKey("is_constraint"))
                    row.is_constraint = (bool?)ConvertTo(values["is_constraint"], typeof(bool?));

                if (values.ContainsKey("capacity"))
                    row.capacity = ToNullableInt(values["capacity"]); // int? in your DBML

                context.SubmitChanges();

                // If you need to sync calendar via SP, uncomment:
                // context.ExecuteCommand("EXEC dbo.sp_update_scheduled_resource_Calendar @resource_group = {0}", id);
            }
        }

        internal static void InsertDBRScheduleResourceParameters(Dictionary<string, object> values)
        {
            using (var context = new ParametersDataModelDataContext())
            {
                var id = values.ContainsKey("resource_group") ? Convert.ToString(values["resource_group"]) : null;
                if (string.IsNullOrWhiteSpace(id)) return;

                var item = new ocx_param_scheduled_resource();
                WriteValuesToRow(item, values); // keys expected: resource_group, is_constraint, capacity (int?)

                // In case values["capacity"] came as decimal, coerce to int? explicitly
                if (values.ContainsKey("capacity"))
                    item.capacity = ToNullableInt(values["capacity"]);

                context.ocx_param_scheduled_resources.InsertOnSubmit(item);
                context.SubmitChanges();

                // Seed calendar via SP if required:
                // context.ExecuteCommand("EXEC dbo.sp_add_scheduled_resource_calendar @resource_group = {0}", id);
            }
        }

        internal static void DBRDeleteScheduleResources(string resGrp)
        {
            using (var context = new ParametersDataModelDataContext())
            {
                var master = context.ocx_param_scheduled_resources.SingleOrDefault(x => x.resource_group == resGrp);
                if (master == null) return;

                var calendars = context.ocx_param_resource_calendars.Where(x => x.resource == resGrp);

                using (var ts = new TransactionScope())
                {
                    context.ocx_param_resource_calendars.DeleteAllOnSubmit(calendars);
                    context.ocx_param_scheduled_resources.DeleteOnSubmit(master);
                    context.SubmitChanges();
                    ts.Complete();
                }
            }
        }

        // ====================================================
        // CALENDAR (Selected item grid) – ocx_param_resource_calendars
        // ====================================================

        internal static void UpdateDBRScheduleResourceCalendarParameters(Dictionary<string, object> values, string name)
        {
            using (var context = new ParametersDataModelDataContext())
            {
                var res = values.ContainsKey("resource") ? Convert.ToString(values["resource"]) : null;
                if (string.IsNullOrWhiteSpace(res)) return;

                // dates accepted as DateTime or "yyyy-MM-dd"
                DateTime? date = null;
                if (values.ContainsKey("dates"))
                {
                    var dv = values["dates"];
                    if (dv is DateTime dt) date = dt;
                    else if (dv is string s) date = DateTime.Parse(s, CultureInfo.InvariantCulture);
                }
                if (date == null) return;

                var row = context.ocx_param_resource_calendars
                                 .SingleOrDefault(x => x.resource == res && x.dates == date.Value);
                if (row == null) return;

                // Only capacity (working_hours) is editable in UI; type = int? (same as master)
                if (values.ContainsKey("working_hours") || values.ContainsKey("capacity"))
                {
                    var raw = values.ContainsKey("working_hours") ? values["working_hours"] : values["capacity"];
                    var cap = ToNullableInt(raw) ?? 0;

                    row.working_hours = cap;
                    row.is_off = (cap == 0);   // rule: 0 hours => off
                    row.is_customised = true;  // user touched it
                }

                // If caller explicitly provided is_off, respect it (and force hours=0 when off)
                if (values.ContainsKey("is_off"))
                {
                    var off = (bool?)ConvertTo(values["is_off"], typeof(bool?)) ?? false;
                    row.is_off = off;
                    if (off) row.working_hours = 0;
                }

                context.SubmitChanges();
            }
        }
    }
}
