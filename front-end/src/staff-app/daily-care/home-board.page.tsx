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
import { RollStateType, RollInput } from "shared/models/roll"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [studentsList,setStudentsList]:any=useState()
  const [sortOrder,setSortOrder]=useState('decending')
  const [sortingText,setSortingText]=useState('First Name')
  const [submitAttendance] = useApi({url:'save-roll'})
  const [attendanceList, setAttendanceList] = useState<Person[]>([])
  const [rollArray, setRollArray] = useState<RollStateType[]>([])
  const [rollStateList, setRollStateList] = useState<StateList[]>([
    { type: "all", count: 0 },
    { type: "present", count: 0 },
    { type: "late", count: 0 },
    { type: "absent", count: 0 },
  ])
  const [attendance, setAttendance] = useState<RollInput>({ student_roll_states: [] })

  useEffect(() => {
    void getStudents()
    setStudentsList(data?.students)
  }, [])

  useEffect(() => {
    let newStateList = [...rollStateList]
    newStateList.map((state) => {
      state.count = 0
      rollArray.map((roll) => {
        if (roll === state.type) {
          state.count = state.count + 1
        }
      })
    })
    newStateList[0].count = newStateList[1].count + newStateList[2].count + newStateList[3].count
    setRollStateList(newStateList)
  }, [rollArray])

  const onRollAction = (id: number, rollState: RollStateType) => {
    let entryPresent = false
    if (attendance) {
      const newAttendance = attendance?.student_roll_states.map((roll) => {
        if (roll.student_id === id) {
          entryPresent = true
          roll.roll_state = rollState
        }
      })
      if (!entryPresent) {
        let latestAttendance = attendance
        latestAttendance.student_roll_states = [...attendance.student_roll_states, { student_id: id, roll_state: rollState }]
        setAttendance(latestAttendance)
      }
    }
    let newRollArray = [...rollArray]
    newRollArray[id] = rollState
    setRollArray(newRollArray)
  }

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
    let res=studentsList.filter((x: { first_name: string; last_name: string })=>x.first_name===searchedName|| x.last_name===searchedName|| searchedName===x.first_name+ " "+ x.last_name)
    if(searchedName.length===0){
      void getStudents()
      setStudentsList(data?.students)
    }
    if(res.length>0){
       setStudentsList(res)
    } 
 }

  const onActiveRollAction = (action: ActiveRollAction) => {
    setIsRollMode(false)
    if (data) setAttendanceList(data.students)
    if (action === "complete") {
      console.log(attendance)
      const res = submitAttendance(attendance);
      console.log(res);
    }
  }

  const filterByAttendace = (type: ItemType) => {
    if (data) {
      const newStudentList = data.students.filter((student) => {
        return type === "all" ? !!rollArray[student.id] : rollArray[student.id] === type
      })
      setAttendanceList(newStudentList)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} sortingText={sortingText} handleSearch={handleSearch} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded"  && studentsList && (
          <>
            {studentsList?.map((s: any) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} onRollChange={onRollAction} rollStateList={rollArray} />
            ))}
          </>
        )}

        {loadState === "error" && studentsList===null && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} stateList={rollStateList} onRollFilterClick={filterByAttendace} />
    </>
  )
}

type ToolbarAction = "roll" | "sort" | "changeSortFilter"| "search"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  sortingText: string
  handleSearch: any
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, sortingText, handleSearch } = props

 
  return (
    <S.ToolbarContainer>
      <S.Row>
        <div onClick={() => onItemClick("sort")}>{sortingText} </div>
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

interface StateList {
  type: ItemType
  count: number
}

type ItemType = RollStateType | "all"