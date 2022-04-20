import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Spacing } from "shared/styles/styles"
import {getActivities} from "../../api/get-activities"



export const ActivityPage: React.FC = () => {

  const [data,setData]=useState<any>()

  const fetchRolls=async()=>{
    const res= await getActivities()
    setData(await Promise.resolve(res.activity)) 
  }
  
  console.log(data)
  useEffect(()=>{
     fetchRolls()
  },[])

  return (<S.Container>
    {data?.map((d:any) => (
     <S.Card key={d.entity.id}>
       <S.Heading>{d.entity.name}</S.Heading>
       <S.Table>
         <thead>
            <tr>
                <S.Th>Student ID</S.Th>
                <S.Th>Attendance Status</S.Th>
            </tr>
         </thead>
       
         <tbody>
              {d.entity.student_roll_states.map((s:any)=>{
                return(
                  <>
                  <tr key={s.student_id}>
                    <S.Td>{s.student_id}</S.Td>
                    <S.Td>{s.roll_state}</S.Td>   
                  </tr>
                  
                  </>
                )
              })}
       </tbody>
      </S.Table>
      <h5>(taken on {Date(d.entity.completed_at)}</h5>
    </S.Card>
     )
     )}
  </S.Container>)
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 0;
    align-items: center;
    justify-content: center;
  `,

  Card: styled.div`
    display: flex;
    flex-direction: column;
    min-width: 50vw;
    min-height: 20vh;
    max-width: 500px;
    max-height: 800px;
    margin: 10px;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-radius: 10px;
    border: 0.5px solid #FFF;
  `,

  Table: styled.table`
    table-layout: auto;
    border: 1px solid black;
    width: 60%;
  `,

  Th: styled.th`
    border: 1px solid #999;
    padding: 0.5rem;
    text-align :center;
  `,

  Td: styled.td`
    border: 1px solid #999;
    padding: 0.5rem;
    text-align: center;
    vertical-align: middle;
  `,

  Heading: styled.h2`
    font-soze: 25px;
    font-weight: 500;
  ` 

}
