using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System;
using System.Globalization;

    public static class DateParser
    {
        public static DateTime? ParseToDateTimePickerValue(string input)
        {
            // List of date formats to try
            string[] formats = new[]
            {
            "dd.MM.yyyy HH:mm",
            "MM/dd/yyyy HH:mm",
            "yyyy-MM-dd HH:mm",
            "dd.MM.yyyy",
            "MM/dd/yyyy",
            "yyyy-MM-dd",
            "dd-MM-yyyy",
            "dd/MM/yyyy",
            "yyyyMMdd"
        };

            // Cultures to support
            CultureInfo[] cultures = new[]
            {
            new CultureInfo("de-DE"),
            new CultureInfo("en-US")
        };

            DateTime parsedDate;

            // Try parsing with exact formats and cultures
            foreach (var culture in cultures)
            {
                if (DateTime.TryParseExact(input, formats, culture, DateTimeStyles.None, out parsedDate))
                {
                    return parsedDate;
                }
            }

            // Optional fallback: Try loose parsing with system culture
            if (DateTime.TryParse(input, out parsedDate))
            {
                return parsedDate;
            }

            // Return null if no format matches
            return null;
        }
    }
