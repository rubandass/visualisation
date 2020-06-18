from mongoengine import *
from flask import Flask, render_template, redirect, url_for
import json
from collections import namedtuple
from pymongo import MongoClient
import os
import csv
from flask import jsonify
from flask_cors import CORS
from flask import request

app = Flask(__name__)
CORS(app)
app.config.from_object('config')

connect('globalgdp')
client = MongoClient()
db = client.globalgdp

class Country(Document):
    name = StringField()
    data = DictField()    

# read countries data
@app.route('/readcountries')
def read_country():
    for file in os.listdir(app.config['FILES_FOLDER']):
        filename = os.fsdecode(file)
        path = os.path.join(app.config['FILES_FOLDER'],filename)
        with open(path) as csvfile:
            reader = csv.DictReader(csvfile) 
            d = list(reader)
            for data in d:
                country = Country() # a blank placeholder country
                dict = {} # a blank placeholder data dict
                for key in data: # iterate through the header keys
                    if key == "country":
                        # check if this country already exists in the db
                        country_exists = db.country.find({"name" :data.get(key)}).count() > 0
                        if not country_exists:
                            country.name = data.get(key)
                        else:
                            country = Country.objects.get(name = data.get(key))
                            dict = country.data
                    else:
                        f = filename.replace(".csv","")
                        if f in dict:
                            dict[f][key] = data[key]
                        else:
                            dict[f] = {key:data[key]}
                    # add the data dict to the country
                    country.data = dict
                # save the country
                country.save()
    return redirect(url_for("index"))



@app.route('/')
def index():
    return render_template("index.html", title = "Home", page="home")

@app.route('/inspiration')
def inspiration():
    return render_template("inspiration.html", title = "Inspirations", page="inspiration")

@app.route('/documentation')
def documentation():
    return render_template("documentation.html", title = "Documentation", page="documentation")    

@app.route("/data")    
def country_data():
    countries_list = db.country.distinct('name')
    countries_list.sort()
    return render_template("data.html", title = "Visualisation", page = "data", countries_data = countries_list) 

# API's for get all countries andd specific country
@app.route('/countries', methods=['GET'])
@app.route('/countries/<country_name>', methods=['GET'])
def get_country(country_name=None):
    if country_name is None:
        countries_list = db.country.distinct('name')
        countries_list.sort()
        return jsonify({"countries":countries_list})
    
    else:
        try:
            country_data = Country.objects.get(name = country_name)
            return jsonify({"status" : "success", "country_data" : country_data.data})
        except:
            return jsonify({"status" : "fail", "error_message" : "Country details not found."})

# API for edit country
@app.route('/country/edit', methods=['POST'])
def edit_country():
    data = request.get_json()['data']
    country_name = data['country']
    year = data['year']
    con = Country.objects.get(name = country_name)
    con['data']['industry_percent_of_gdp'][year] = data['industry']
    con['data']['agriculture_percent_of_gdp'][year] = data['agriculture']
    con['data']['services_percent_of_gdp'][year] = data['services']
    con.save()
    return jsonify({"status":"success"})

# API for delete country
@app.route('/country/delete', methods=['DELETE'])
def delete_country():
    data = request.get_json()['data']
    country_name = data['country']
    db.country.delete_one({'name' : country_name})
    return jsonify({"status":"success"})  

# 404 error handler
@app.errorhandler(404) 
def page_not_found_404(e):
  return render_template('404.html', title = "Error", error = e), 404
  
# 500 error handler
@app.errorhandler(500) 
def page_not_found_500(e):
  return render_template('500.html', title = "Error", error = e), 500         

if __name__ =="__main__":
    app.run(debug=True, port=8080, host='0.0.0.0')
