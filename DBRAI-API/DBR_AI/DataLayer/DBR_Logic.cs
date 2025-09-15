using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Data.SqlClient;
using System.Globalization;
using System.Threading;
using System.IO;
using System.Web.UI;
using System.Data.OleDb;
 

public static class DBR_Logic
    {

    private static int Constraint_Factor = 2;
    private static String Query;
    private static DataSet ds, ds1, ds2;
    private static DB db = new DB();
    public static string Find_production_orders_has_more_than_one_constraint()
    {
        Query = "  SELECT ps.[Production_Order_Nr] " +
            " FROM [pub].[ocx_base_Porduction_orders] ps " +
            " JOIN [pub].[ocx_param_scheduled_resource]  cr " +
                " ON ps.[Ressource] = cr.Resource_Group and cr.Is_Constraint='1' " +
            " GROUP BY  ps.[Production_Order_Nr] " +
            " HAVING COUNT(DISTINCT ps.[Ressource]) >= 2 ";
            ds1 = db.SelectRows(Query, 0, 0, "Conflict_po_List");

        string Orders = string.Empty;
        //-----------Exclude all production orders with conflict------------------------------------
        for (int i = 0; i < ds1.Tables["Conflict_po_List"].Rows.Count; i++)
        {
            Orders += ds1.Tables["Conflict_po_List"].Rows[i]["Production_Order_Nr"].ToString() + " / ";
           
        }
        return Orders;
    }
    public static DataTable Find_production_orders_has_more_than_one_constraintDataTable()
    {
        Query = "  SELECT ps.[Production_Order_Nr] " +
            " FROM [pub].[ocx_base_Porduction_orders] ps " +
            " JOIN [pub].[ocx_param_scheduled_resource]  cr " +
                " ON ps.[Ressource] = cr.Resource_Group and cr.Is_Constraint='1' " +
            " GROUP BY  ps.[Production_Order_Nr] " +
            " HAVING COUNT(DISTINCT ps.[Ressource]) >= 2 ";
        ds1 = db.SelectRows(Query, 0, 0, "Conflict_po_List");
        return ds1.Tables["Conflict_po_List"];
    }

    public static void Recalculate_Target_buffer()
    {
        Query = "Update T1 set T1.Target_Buffer_Size = (select count(*) from[pub].[ocx_base_Porduction_orders] as PO where PO.Production_Order_Nr = T1.Production_Order_Nr)*2  " +
                                                       "from [pub].[ocx_base_Porduction_orders] as T1 where Is_Excluded = '0' ";
        db.SelectRows(Query, 0, 0, "T");
        Query = "Update T1 set T1.Remaining_Target_Buffer_Size = [dbo].[Get_Working_Days_Between_Dates](GETDATE(), Production_Order_Target_Date,T1.Ressource) from [pub].[ocx_base_Porduction_orders] as T1 where Is_Excluded = '0'";
        db.SelectRows(Query, 0, 0, "T");
        //refresh_datagridview();
        Query = "Update T1 set T1.Target_RBC = (CAST((T1.Target_Buffer_Size - T1.Remaining_Target_Buffer_Size) as float) / T1.Target_Buffer_Size) * 100 from [pub].[ocx_base_Porduction_orders] as T1 where Is_Excluded = '0'";
        db.SelectRows(Query, 0, 0, "T");
        //refresh_datagridview();
    }
    public static Boolean Run_DBR(string constraint_resource)
    {
       Recalculate_Target_buffer();
        //-----------------------------Running_Sum on constaint ROWS------------------------------------------------------------------
        Query = "  Update T1" +
                    "   Set T1.Running_Sum_of_Production_Time = T2.cumulative_sum," +
                    "       T1.Expected_start_time = T2.lag_cumulative_sum" +
                    "      ,T1.Start_Date_based_on_Assumption_of_8hrs = dbo.Get_Working_Date_After_Minutes(GETDATE(), T2.lag_cumulative_sum ,'" + constraint_resource + "') " +  // assume the production time is minute for each pieces (processtime was for 10 pieces and converted in mapping postprocessing to minutes)
                                                                                                                                                                                 //"      ,T1.Start_Date_based_on_Assumption_of_8hrs = DATEADD(DAY,(T2.lag_cumulative_sum/480),getdate())" +
                    "  from [pub].[ocx_base_Porduction_orders] T1 inner join " +
                    "  (   select  cumulative_sum" +
                    "             ,ISNULL(lag(cumulative_sum) over (order by [Priority] asc , [Worksteps_to_Go] asc ,[Target_RBC] desc ,[Production_Order_Nr] asc),0) lag_cumulative_sum" + // order by [Production_Order_Nr] 
                    "  		   ,[Production_Order_Nr]" +
                    "  		   ,[Work_Step_Nr]" +
                    "  		   ,Ressource" +
                    "      from" +
                    "     (" +
                    "  		SELECT sum([Production_Time]) over (order by [Priority] asc , [Worksteps_to_Go] asc ,[Target_RBC] desc ,[Production_Order_Nr] asc) cumulative_sum" +
                    "  			   ,*" +
                    "  		  FROM [pub].[ocx_base_Porduction_orders]" +
                    "  		  where  Ressource = '" + constraint_resource + "' and [Worksteps_to_Go] >= 0 and Is_Excluded = '0'" +   // "blau"
                    "      ) T" +
                    "   ) T2" +
                    "   on T1.[Production_Order_Nr] = T2.[Production_Order_Nr] and T1.[Work_Step_Nr] = T2.[Work_Step_Nr] and T1.Ressource = T2.Ressource" +
                    "   where T1.Ressource = '" + constraint_resource + "' and Is_Excluded = '0'"; // "blau"
        db.SelectRows(Query, 0, 0, "T");
        //-----------------------------Running_Sum on ALL ROWS------------------------------------------------------------------
        //--------------------(update other steps target_date)Extend constraint new start date to all rows before(AG_to_Go <=..) constraint according to the productopn number----------
        Query = "update T1 " +
                "   set T1.[Production_Order_Target_Date] = T2.Start_Date_based_on_Assumption_of_8hrs" +
                "      ,T1.[Target_Type] = 'EP - " + constraint_resource + "' " +
                "FROM [pub].[ocx_base_Porduction_orders] T1 inner join " +
                "( " +
                "	SELECT Production_Order_Nr,Worksteps_to_Go,Start_Date_based_on_Assumption_of_8hrs " +
                "	  FROM [pub].[ocx_base_Porduction_orders] " +
                "	where Ressource= '" + constraint_resource + "' " +   // "blau"
                ") T2 on T1.Production_Order_Nr = T2.Production_Order_Nr And T1.Worksteps_to_Go < T2.Worksteps_to_Go and Is_Excluded = '0'" +
                "--where T1.Worksteps_to_Go <= T2.Worksteps_to_Go and Is_Excluded = '0'";
        db.SelectRows(Query, 0, 0, "T");
        //---------------------ReCalculate Step 3: Calculate Remain Buffer Size---------------
        Recalculate_Target_buffer();
        //---------------------ReCalculate Step 4: Calculate target remain buffer size consumed percentage---------------
        Query = "Update T1 set T1.prio = CASE   WHEN Target_RBC<0  THEN '2-Gray'  WHEN Target_RBC< 33 THEN '2-Green' WHEN Target_RBC< 66 THEN '2-Yellow'  WHEN Target_RBC< 100 THEN '2-Red' WHEN Target_RBC >= 100 THEN '1' ELSE '' END from [pub].[ocx_base_Porduction_orders] as T1 where Is_Excluded = '0'";
        db.SelectRows(Query, 0, 0, "T");
        return true;

    }
    public static Boolean Run_DBR_on_All_Constraints()
    {
        //---------------Reset Excluded production numbers--------------------------------------------
        db.SelectRows("Update [pub].[ocx_base_Porduction_orders] set Is_Excluded= '0' ", 0, 0, "T");
        //---------------Re-find and exclude production numbers involving more than oner constraint--------------------------------------------
        DataTable Conflict_po_List = DBR_Logic.Find_production_orders_has_more_than_one_constraintDataTable();
        if (Conflict_po_List.Rows.Count > 0)
        {
            string Orders = "";
            //-----------Exclude all production orders with conflict------------------------------------
            for (int i = 0; i < Conflict_po_List.Rows.Count; i++)
            {
                Orders += Conflict_po_List.Rows[i]["Production_Order_Nr"].ToString() + " / ";
                db.SelectRows("Update [pub].[ocx_base_Porduction_orders] set Is_Excluded=1 where Production_Order_Nr = '" + Conflict_po_List.Rows[i]["Production_Order_Nr"].ToString() + "'", 0, 0, "T");
            }
        }
        //-----------Run the DBR logic on all constraints------------------------------------
        ds2 = db.SelectRows("SELECT [Resource_Group] ,[Capacity] FROM [pub].[ocx_param_scheduled_resource]  where [Is_Constraint] = '1'", 0, 0, "T");
        for (int i = 0; i < ds2.Tables["T"].Rows.Count; i++)
        {
            DBR_Logic.Run_DBR(ds2.Tables["T"].Rows[i]["Resource_Group"].ToString());
        }
        return true;
    }
    public static void Reset_DBR()
    {
       //--------Reset data------------------
       db.SelectRows("Truncate table [pub].[ocx_base_Porduction_orders]", 0, 0, "T");
       db.SelectRows("insert into [pub].[ocx_base_Porduction_orders] SELECT * FROM [pub].[ocx_base_Porduction_orders_bak]", 0, 0, "T");            
    }

}
 