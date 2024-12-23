import pandas as pd
import censusdata

""" 
This function uses the censusdata package to get the data for all the counties 
from Census Bureau and saves it in data/census_data.csv.
"""

detail_tables = {'B01003_001E' : 'population', "B02001_001E": "race_total", "B02001_003E": "black_total", "B03002_001E": "race_hispanic_total", "B03002_003E": "white_alone", "B03002_012E" : "hispanic_total"}
subject_tables = {"S1501_C02_015E": "percent_bachelors", "S1901_C01_012E": "median_income"}

# 5-year ACS data is often two years behind the calendar year
CENSUS_YEAR = 2022

columns = ['key']
columns.extend(list(detail_tables.values()) + list(subject_tables.values()))
pd.set_option('max_colwidth', 800)

def main():
  print("getting all data")
  data = getAllCounties()

  print("processing data")
  processed_data = processData(data)

  processed_data.to_csv('data/census_data.csv', index=False)

def getAllCounties():
  states = censusdata.geographies(censusdata.censusgeo([('state', '*')]), 'acs5', CENSUS_YEAR)

  all_states = pd.DataFrame() 

  # For every state, get all counties
  for state in states:
    print("getting: ", state)
    if state == "Alaska" or state == "District of Columbia":
      continue
    state_fips = states[state].geo[0][1]
    counties = censusdata.geographies(censusdata.censusgeo([('state', state_fips), ('county', '*')]), 'acs5', CENSUS_YEAR)

    subject_data = censusdata.download('acs5', CENSUS_YEAR,
             censusdata.censusgeo([('state', state_fips),
                                   ('county', '*')]),
            list(subject_tables.keys()), tabletype='subject').reset_index()
    detail_data = censusdata.download('acs5', CENSUS_YEAR,
             censusdata.censusgeo([('state', state_fips),
                                   ('county', '*')]),
            list(detail_tables.keys())).reset_index()

    # Get correct fips for index
    subject_data['index'] = subject_data.apply(lambda row : getFips(row['index']), axis = 1)
    detail_data['index'] = detail_data.apply(lambda row : getFips(row['index']), axis = 1)

    # Join the tables and add to master table
    data = detail_data.merge(subject_data)
    all_states = pd.concat([all_states, data])

  # Set column names to human readable names
  results = all_states.set_axis(columns, axis=1)
  return results

# Gets a fips code from the returned geo object from census
def getFips(geo_data):
  geo_info = geo_data.geo
  state = geo_info[0][1]
  county = geo_info[1][1]
  return state + county

# Do the calculations we need to do on census data
def processData(data):
  data['percent_black'] = data['black_total']/data['race_total']
  data['percent_white'] = data['white_alone'] / data['race_hispanic_total']
  data['percent_hispanic'] = data['hispanic_total'] / data['race_hispanic_total']
  data['percent_bachelors'] = data['percent_bachelors'].astype(float) / 100
  return data

if __name__ == "__main__":
  main()