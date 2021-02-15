import { React } from 'jimu-core'

import { CalciteP, CalciteH5 } from 'calcite-react/Elements'

import styled from 'styled-components'


const Section = styled.div`
  margin-top: 20px;
  maring-bottom: 20px;
`


export default class Introduction extends React.Component {

    render() {
        return(
          <div>
            <CalciteP>
              Get started on your own community boundaries by drawing on map to your right. After you have submitted your
              community outline, there will be a chance to explore what others have submitted for their own communities.
            </CalciteP>

            <hr style={{margin: 0}}/>

            <Section>
              <CalciteH5 style={{marginBottom: '5px'}}>Understanding COIs</CalciteH5>
              <CalciteP>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent elit massa, ultricies id est in, 
              tempor condimentum augue. Cras quis blandit tellus, at tincidunt sapien. Duis 
              mollis sapien vel luctus molestie. Vivamus facilisis dui ut arcu cursus semper. 
              Interdum et malesuada fames ac ante ipsum primis in faucibus.
              </CalciteP>
            </Section>

            <Section>
              <CalciteH5 style={{marginBottom: '5px'}}>How You Can Help</CalciteH5>
              <CalciteP>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent elit massa, ultricies id est in, 
              tempor condimentum augue. Cras quis blandit tellus, at tincidunt sapien. Duis 
              mollis sapien vel luctus molestie. Vivamus facilisis dui ut arcu cursus semper. 
              Interdum et malesuada fames ac ante ipsum primis in faucibus.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent elit massa, ultricies id est in, 
              tempor condimentum augue. Cras quis blandit tellus, at tincidunt sapien. Duis 
              mollis sapien vel luctus molestie. Vivamus facilisis dui ut arcu cursus semper. 
              Interdum et malesuada fames ac ante ipsum primis in faucibus.
              </CalciteP>
            </Section>

            <Section>
              <CalciteH5 style={{marginBottom: '5px'}}>Polsby Popper</CalciteH5>
              <CalciteP style={{marginBottom: '12px'}}>
                Compactness measures like the Polsby Popper Ratio have been widely used to assess geographic gerrymandering. You may have seen unusual distrcits before and this 
                index can be used as a shorthand for gerrmandering in some cases.
              </CalciteP>
            </Section>

            <Section>
              <CalciteH5 style={{marginBottom: '5px'}}>Diversity in Your District</CalciteH5>
              <CalciteP>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent elit massa, ultricies id est in, 
              tempor condimentum augue. Cras quis blandit tellus, at tincidunt sapien. Duis 
              mollis sapien vel luctus molestie. Vivamus facilisis dui ut arcu cursus semper. 
              Interdum et malesuada fames ac ante ipsum primis in faucibus.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent elit massa, ultricies id est in, 
              tempor condimentum augue. Cras quis blandit tellus, at tincidunt sapien. Duis 
              mollis sapien vel luctus molestie. Vivamus facilisis dui ut arcu cursus semper. 
              Interdum et malesuada fames ac ante ipsum primis in faucibus.
              </CalciteP>
            </Section>

          </div>
        )
    }

}