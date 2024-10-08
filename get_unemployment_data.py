import pandas as pd
import os

# Pulls unemployment data from https://www.bls.gov/lau/tables.htm, which is a long page full of links.
# Download the file and save as unemployment_data.xlsx in the root directory
def get_unemployment_data():
    xlsx = pd.read_excel("unemployment_data.xlsx", usecols=[1,2,4,8])
    xlsx = xlsx.iloc[5:]
    xlsx.columns = ['state_fips', 'county_fips', 'year', 'unemployment']
    xlsx['key'] = xlsx['state_fips'] + xlsx['county_fips']
    xlsx['unemployment'] = xlsx['unemployment'].astype(float)/100
    xlsx = xlsx.drop(columns=['state_fips', 'county_fips'])

    xlsx.to_csv('data/unemployment_data.csv', index=False, encoding='utf-8',)
    os.remove("unemployment_data.xlsx")


if __name__ == "__main__":
  get_unemployment_data()