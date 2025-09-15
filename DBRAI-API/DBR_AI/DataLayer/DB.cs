using System;
using System.Data;
using System.Data.SqlClient;

public partial class DB
{
    public DB()
    {
    }

    //public string cString = @"Data Source=.;Initial Catalog=Drum_Buffer_Rope_Test_ME;Integrated Security=True;Pooling=True;";

    public string cString = "user id=ASP_ADMIN;" +
    "password=asp_user1;" +
    "initial catalog=OCX_DBR;" +
    "data source=192.168.178.36;" +
    "Connect Timeout=50;" +
    "Pooling=True;";
    //--------------------------------------------------------------------------------------------------

    public string SqlStr
    {
        get
        {
            return this.cString;
        }
    }

    public DataSet SelectRows(string query, int start, int max, string table)
    {
        DataSet dataset = new DataSet();
        try
        {
            using (SqlConnection conn = new SqlConnection(this.cString))
            {
                SqlDataAdapter adapter = new SqlDataAdapter(query, conn);
                if (max > 0)
                {
                    adapter.Fill(dataset, start, max, table);
                }
                else
                {
                    adapter.Fill(dataset, table);
                }
            }
        }
        catch (Exception ex)
        {

            throw;
        }
       
        return dataset;
    }


    public void DataCommand(string query)
    {
        using (SqlConnection conn = new SqlConnection(this.cString))
        {
            conn.Open();
            SqlCommand dataCommand = new SqlCommand(query, conn);
            dataCommand.ExecuteReader();
        }
    }
}