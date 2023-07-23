import http.server
import json
import arcpy 
from arcgis.gis import GIS
from arcgis.geometry import Polyline
import shapefile
import os
from datetime import datetime


class JSONHandler(http.server.BaseHTTPRequestHandler):

    def do_POST(self):
        # Get the content length from the request headers
        content_length = int(self.headers['Content-Length'])

        # Read the raw JSON data from the request
        raw_data = self.rfile.read(content_length)

        try:
            # Parse the JSON data
            data = json.loads(raw_data.decode('utf-8'))

         #   print(data)
            temp_data = []
            combined_path = []
            spatial_reference = data['directionline'][0]["geometry"]["spatialReference"]
            for i in (data['directionline']):
                #print(i['geometry'])
                combined_path.extend(i['geometry']['paths'])
            #print(temp_data[0])

            combined_polyline = Polyline({"paths":combined_path,"spatialReference":spatial_reference})


            # Define the name of the shapefile and its geometry type
            shapefile_name = "NewShapefile"
            geometry_type = "POLYLINE"

            

            # Define the spatial reference of the shapefile (optional)
            spatial_reference = arcpy.SpatialReference(3857)  # Example: WGS 1984 (4326)

            folder_path = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\f2"

            items = os.listdir(folder_path)
        
            # Check if the folder is empty
        
            if len(items) != 0:
                # Loop through each item and delete files or remove directories
                for item in items:
                    item_path = os.path.join(folder_path, item)
                    if os.path.isfile(item_path):
                        # Delete the file
                        os.remove(item_path)


            # Create the empty shapefile
            shapefile_path = arcpy.CreateFeatureclass_management(folder_path, shapefile_name, geometry_type, spatial_reference = spatial_reference)

            

            # Replace 'polyline_array' with your actual array containing the polyline coordinates
            polyline_array = combined_path #[[x1, y1], [x2, y2], ...]

            

            # Create a list to store the polyline features
            polylines = []

            # Convert each set of coordinates to arcpy.Point objects and create polylines
            for polyline_coords in polyline_array:
                array = arcpy.Array([arcpy.Point(float(coords[0]), float(coords[1])) for coords in polyline_coords])
                polylines.append(arcpy.Polyline(array, spatial_reference))

            # Open an InsertCursor to insert the polyline features into the shapefile
            with arcpy.da.InsertCursor(shapefile_path, ["SHAPE@"]) as cursor:
                for polyline in polylines:
                    cursor.insertRow([polyline])

            #earthquake = shapefile.Reader("C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\earthquakesRisk\\earthquakes\\earthquakeRisk.shp")
            
           # folder_path = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\output"
           # os.mkdir(folder_path)

            #items = os.listdir(folder_path)
        
            # Check if the folder is empty
            #try:
             #   if len(items) != 0:
                    # Loop through each item and delete files or remove directories
              #      for item in items:
               #         item_path = os.path.join(folder_path, item)
                #        if os.path.isfile(item_path):
                            # Delete the file
                 #           os.remove(item_path)
            #except:
            #    pass

            ## Eathquake  ###########################################################################
            
            infeature1 = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\f2\\NewShapefile.shp"
            infeature2 = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\Earthquake_Data\\Earthquake_Data\\EarthquakeRisk.shp"
            base_folder = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\output_earthquake"
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            folder_path = os.path.join(base_folder, timestamp)
            os.mkdir(folder_path)
            ttemp = (os.path.join(folder_path,timestamp))
            # Process: Find all stream crossings (points)
            inFeatures = [infeature1, infeature2]
            intersectOutput = ttemp #os.path.join(folder_path,timestamp) #r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output"
            arcpy.analysis.Intersect(inFeatures, intersectOutput, "", "", "point")

            #print(os.path.join(ttemp + timestamp + ".sh"))
            print(os.path.join(ttemp + ".shp"))
            arcpy.management.AddJoin(
                in_layer_or_view= os.path.join(ttemp + ".shp") , #s.path.join(base_folder, timestamp + ".sh"), #r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output.shp",
                in_field="Id_1",
                join_table= r"C:\Users\rit13425\Desktop\hackathon\georiskpro\Earthquake_Data\Earthquake_Data\EarthquakeRisk.shp",
                join_field="Id",
                index_join_fields="NO_INDEX_JOIN_FIELDS",
                rebuild_index="NO_REBUILD_INDEX",
                join_type="KEEP_COMMON"
            )

            # Path to the shapefile you want to read
            shapefile_path = os.path.join(ttemp + ".shp")#r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output.shp"

            data_points = []

            # Open a SearchCursor to read the shapefile
            fields = ["SHAPE@", "gridcode","Shape"]  # Replace field1, field2, ... with the field names you want to access
            with arcpy.da.SearchCursor(shapefile_path, fields) as cursor:
                for row in cursor:
                    
                    # Access geometry and attribute information for each feature
                   # geometry = row[0]  # The geometry of the feature (arcpy.Geometry object)
                    attribute1 = row[1]  # The value of "field1" attribute for the feature
                    attribute2 = row[2]  # The value of "field2" attribute for the feature
                    print(attribute2)
                    data_points.append(("Earthquake",attribute2,attribute1))

            ## Eathquake  ###########################################################################


            ## Hurricane  MAY ###########################################################################

            infeature1 = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\f2\\NewShapefile.shp"
            infeature2 = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\Hurricane_Data\\Hurricane_Data\\HurricaneRisk_MAY.shp"
            base_folder = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\output_hurricane"
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            folder_path = os.path.join(base_folder, timestamp)
            os.mkdir(folder_path)
            ttemp = (os.path.join(folder_path,timestamp))
            # Process: Find all stream crossings (points)
            inFeatures = [infeature1, infeature2]
            intersectOutput = ttemp #os.path.join(folder_path,timestamp) #r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output"
            arcpy.analysis.Intersect(inFeatures, intersectOutput, "", "", "point")

            #print(os.path.join(ttemp + timestamp + ".sh"))
            print(os.path.join(ttemp + ".shp"))
            arcpy.management.AddJoin(
                in_layer_or_view= os.path.join(ttemp + ".shp") , #s.path.join(base_folder, timestamp + ".sh"), #r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output.shp",
                in_field="Id_1",
                join_table= r"C:\Users\rit13425\Desktop\hackathon\georiskpro\\Hurricane_Data\\Hurricane_Data\\HurricaneRisk_MAY.shp",
                join_field="Id",
                index_join_fields="NO_INDEX_JOIN_FIELDS",
                rebuild_index="NO_REBUILD_INDEX",
                join_type="KEEP_COMMON"
            )

            # Path to the shapefile you want to read
            shapefile_path = os.path.join(ttemp + ".shp")#r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output.shp"

           # data_points = []

            # Open a SearchCursor to read the shapefile
            fields = ["SHAPE@", "gridcode","Shape","Explain"]  # Replace field1, field2, ... with the field names you want to access
            with arcpy.da.SearchCursor(shapefile_path, fields) as cursor:
                for row in cursor:
                    
                    # Access geometry and attribute information for each feature
                   # geometry = row[0]  # The geometry of the feature (arcpy.Geometry object)
                    attribute1 = row[1]  # The value of "field1" attribute for the feature
                    attribute2 = row[2]  # The value of "field2" attribute for the feature
                    attribute3 = row[3]  # The value of "field3" attribute for the feature
                    print(attribute3)
                    data_points.append(("Hurricane_May",attribute3,attribute2,attribute1))

            ## Hurricane MAY ###########################################################################


            ## Hurricane  JUNE ###########################################################################

            infeature1 = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\f2\\NewShapefile.shp"
            infeature2 = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\Hurricane_Data\\Hurricane_Data\\HurricaneRisk_JUNE.shp"
            base_folder = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\output_hurricane"
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            folder_path = os.path.join(base_folder, timestamp)
            os.mkdir(folder_path)
            ttemp = (os.path.join(folder_path,timestamp))
            # Process: Find all stream crossings (points)
            inFeatures = [infeature1, infeature2]
            intersectOutput = ttemp #os.path.join(folder_path,timestamp) #r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output"
            arcpy.analysis.Intersect(inFeatures, intersectOutput, "", "", "point")

            #print(os.path.join(ttemp + timestamp + ".sh"))
            print(os.path.join(ttemp + ".shp"))
            arcpy.management.AddJoin(
                in_layer_or_view= os.path.join(ttemp + ".shp") , #s.path.join(base_folder, timestamp + ".sh"), #r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output.shp",
                in_field="Id_1",
                join_table= r"C:\Users\rit13425\Desktop\hackathon\georiskpro\\Hurricane_Data\\Hurricane_Data\\HurricaneRisk_JUNE.shp",
                join_field="Id",
                index_join_fields="NO_INDEX_JOIN_FIELDS",
                rebuild_index="NO_REBUILD_INDEX",
                join_type="KEEP_COMMON"
            )

            # Path to the shapefile you want to read
            shapefile_path = os.path.join(ttemp + ".shp")#r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output.shp"

           # data_points = []

            # Open a SearchCursor to read the shapefile
            fields = ["SHAPE@", "gridcode","Shape","Explain"]  # Replace field1, field2, ... with the field names you want to access
            with arcpy.da.SearchCursor(shapefile_path, fields) as cursor:
                for row in cursor:
                    
                    # Access geometry and attribute information for each feature
                   # geometry = row[0]  # The geometry of the feature (arcpy.Geometry object)
                    attribute1 = row[1]  # The value of "field1" attribute for the feature
                    attribute2 = row[2]  # The value of "field2" attribute for the feature
                    attribute3 = row[3]  # The value of "field3" attribute for the feature
                    print(attribute3)
                    data_points.append(("Hurricane_JUNE",attribute3,attribute2,attribute1))

            ## Hurricane JUNE ###########################################################################


            ## Hurricane  JULY1 ###########################################################################

            infeature1 = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\f2\\NewShapefile.shp"
            infeature2 = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\Hurricane_Data\\Hurricane_Data\\HurricaneRisk_JULY1.shp"
            base_folder = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\output_hurricane"
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            folder_path = os.path.join(base_folder, timestamp)
            os.mkdir(folder_path)
            ttemp = (os.path.join(folder_path,timestamp))
            # Process: Find all stream crossings (points)
            inFeatures = [infeature1, infeature2]
            intersectOutput = ttemp #os.path.join(folder_path,timestamp) #r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output"
            arcpy.analysis.Intersect(inFeatures, intersectOutput, "", "", "point")

            #print(os.path.join(ttemp + timestamp + ".sh"))
            print(os.path.join(ttemp + ".shp"))
            arcpy.management.AddJoin(
                in_layer_or_view= os.path.join(ttemp + ".shp") , #s.path.join(base_folder, timestamp + ".sh"), #r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output.shp",
                in_field="Id_1",
                join_table= r"C:\Users\rit13425\Desktop\hackathon\georiskpro\\Hurricane_Data\\Hurricane_Data\\HurricaneRisk_JULY1.shp",
                join_field="Id",
                index_join_fields="NO_INDEX_JOIN_FIELDS",
                rebuild_index="NO_REBUILD_INDEX",
                join_type="KEEP_COMMON"
            )

            # Path to the shapefile you want to read
            shapefile_path = os.path.join(ttemp + ".shp")#r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output.shp"

           # data_points = []

            # Open a SearchCursor to read the shapefile
            fields = ["SHAPE@", "gridcode","Shape","Explain"]  # Replace field1, field2, ... with the field names you want to access
            with arcpy.da.SearchCursor(shapefile_path, fields) as cursor:
                for row in cursor:
                    
                    # Access geometry and attribute information for each feature
                   # geometry = row[0]  # The geometry of the feature (arcpy.Geometry object)
                    attribute1 = row[1]  # The value of "field1" attribute for the feature
                    attribute2 = row[2]  # The value of "field2" attribute for the feature
                    attribute3 = row[3]  # The value of "field3" attribute for the feature
                    print(attribute3)
                    data_points.append(("Hurricane_JULY",attribute3,attribute2,attribute1))

            ## Hurricane JULY1 ###########################################################################



            ## Hurricane  AUG ###########################################################################

            infeature1 = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\f2\\NewShapefile.shp"
            infeature2 = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\Hurricane_Data\\Hurricane_Data\\HurricaneRisk_AUG.shp"
            base_folder = "C:\\Users\\rit13425\\Desktop\\hackathon\\georiskpro\\output_hurricane"
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            folder_path = os.path.join(base_folder, timestamp)
            os.mkdir(folder_path)
            ttemp = (os.path.join(folder_path,timestamp))
            # Process: Find all stream crossings (points)
            inFeatures = [infeature1, infeature2]
            intersectOutput = ttemp #os.path.join(folder_path,timestamp) #r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output"
            arcpy.analysis.Intersect(inFeatures, intersectOutput, "", "", "point")

            #print(os.path.join(ttemp + timestamp + ".sh"))
            print(os.path.join(ttemp + ".shp"))
            arcpy.management.AddJoin(
                in_layer_or_view= os.path.join(ttemp + ".shp") , #s.path.join(base_folder, timestamp + ".sh"), #r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output.shp",
                in_field="Id_1",
                join_table= r"C:\Users\rit13425\Desktop\hackathon\georiskpro\\Hurricane_Data\\Hurricane_Data\\HurricaneRisk_AUG.shp",
                join_field="Id",
                index_join_fields="NO_INDEX_JOIN_FIELDS",
                rebuild_index="NO_REBUILD_INDEX",
                join_type="KEEP_COMMON"
            )

            # Path to the shapefile you want to read
            shapefile_path = os.path.join(ttemp + ".shp")#r"C:\Users\rit13425\Desktop\hackathon\georiskpro\output\output.shp"

           # data_points = []

            # Open a SearchCursor to read the shapefile
            fields = ["SHAPE@", "gridcode","Shape","Explain"]  # Replace field1, field2, ... with the field names you want to access
            with arcpy.da.SearchCursor(shapefile_path, fields) as cursor:
                for row in cursor:
                    
                    # Access geometry and attribute information for each feature
                   # geometry = row[0]  # The geometry of the feature (arcpy.Geometry object)
                    attribute1 = row[1]  # The value of "field1" attribute for the feature
                    attribute2 = row[2]  # The value of "field2" attribute for the feature
                    attribute3 = row[3]  # The value of "field3" attribute for the feature
                    print(attribute3)
                    data_points.append(("Hurricane_AUG",attribute3,attribute2,attribute1))

            ## Hurricane JULY1 ###########################################################################

            response_data = {"status": "success", "message": "JSON data received successfully", "data": data_points}
            response_status = 200
        except json.JSONDecodeError:
            response_data = {"status": "error", "message": "Invalid JSON data"}
            response_status = 400

        # Set the response headers
        self.send_response(response_status)
        self.send_header('Content-type', 'application/json')
        # Add the 'Access-Control-Allow-Origin' header to allow requests from all origins
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        # Send the response data
        response = json.dumps(response_data).encode('utf-8')
        self.wfile.write(response)

if __name__ == '__main__':
    host = 'localhost'
    port = 8000
    server_address = (host, port)

    # Create the HTTP server with our custom JSONHandler
    httpd = http.server.HTTPServer(server_address, JSONHandler)

    print(f"Server started at http://{host}:{port}")
    try:
        # Start the server and keep it running until interrupted
        httpd.serve_forever()
    except KeyboardInterrupt:
        # If the server is interrupted (e.g., by pressing Ctrl+C), stop it gracefully
        print("\nServer stopped")
        httpd.server_close()
