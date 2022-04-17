import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [studentsList,setStudentsList]:any=useState()
  const [sortOrder,setSortOrder]=useState('decending')
  const [sortingText,setSortingText]=useState('First Name')

  useEffect(() => {
    void getStudents()
    setStudentsList(data?.students)
  }, [])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }

    if(action==="sort"){
      if(sortingText==="First Name"){
        if(sortOrder==="decending"){
          let list:any=data?.students.sort((a,b)=> a.first_name>b.first_name? 1:-1)
          setStudentsList(list)
          setSortOrder("ascending")
        }else if(sortOrder==="ascending"){
          let list:any=data?.students.sort((a,b)=> a.first_name<b.first_name? 1:-1)
          setStudentsList(list)
          setSortOrder("decending")
        }
      }

      if(sortingText==="Second Name"){
        if(sortOrder==="decending"){
          let list:any=data?.students.sort((a,b)=> a.last_name>b.last_name? 1:-1)
          setStudentsList(list)
          setSortOrder("ascending")
        }else if(sortOrder==="ascending"){
          let list:any=data?.students.sort((a,b)=> a.last_name<b.last_name? 1:-1)
        
          setStudentsList(list)
          setSortOrder("decending")
        }
      }
    }

    if(action==="changeSortFilter"){
      if(sortingText==="First Name"){
        setSortingText("Second Name")
      }

      if(sortingText==="Second Name"){
        setSortingText("First Name")
      }
    }
  }

  const handleSearch=(e:any)=>{
    e.preventDefault()
    let searchedName=e.target.value
    let res=studentsList.filter(x=>x.first_name===searchedName|| x.last_name===searchedName|| searchedName===x.first_name+ " "+ x.last_name)
    if(searchedName.length===0){
      void getStudents()
      setStudentsList(data?.students)
    }
    if(res.length>0){
       setStudentsList(res)
    } 
 }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} text={sortingText} handleSearch={handleSearch} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded"  && studentsList && (
          <>
            {studentsList?.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}

        {loadState === "error" && studentsList===null && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sort" | "changeSortFilter"| "search"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  text: (value?: string)=>void
  handleSearch: (value?: string)=>void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, text, handleSearch } = props

 
  return (
    <S.ToolbarContainer>
      <S.Row>
        <div onClick={() => onItemClick("sort")}>{text} </div>
        <div onClick={() => onItemClick("changeSortFilter")}> ↑↓ </div>
      </S.Row>
      
      <input placeholder="enter student name" onChange={handleSearch}/>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  Row: styled.div`
    display: flex;
    flex-direction: row;
  `,
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    cursor: pointer;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
