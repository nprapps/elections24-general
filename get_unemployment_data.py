import pandas as pd
import os


# This page (https://www.bls.gov/lau/tables.htm) from the BLS website has links to bunch of files. 
# For 2024, we are using the file currently named as Labor force data by county, not seasonally adjusted, latest 14 months (TXT) (ZIP 2.6MB)
# Download the zip file and save as unemployment_data.xlsx in the temp folder in the root directory

#! Have to update this to get only the latest month. Right now it gets 14 months (July 23 - Aug 24)
def get_unemployment_data():
    xlsx = pd.read_excel("./temp/unemployment_data.xlsx", usecols=[1,2,3,4,8])
    xlsx = xlsx.iloc[5:]
    xlsx.columns = ['state_fips', 'county_fips','statePostal', 'year', 'unemployment']
    xlsx['key'] = xlsx['state_fips'] + "-" + xlsx['county_fips']
    xlsx['unemployment'] = xlsx['unemployment'].astype(float)/100
    xlsx['statePostal'] = xlsx['statePostal']
    xlsx = xlsx.drop(columns=['state_fips', 'county_fips'])

    xlsx.to_csv('data/unemployment_data.csv', index=False, encoding='utf-8',)


if __name__ == "__main__":
  get_unemployment_data()