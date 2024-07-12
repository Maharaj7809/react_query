import { useQuery, useMutation, useQueryClient } from "react-query"
import { getTodos, addTodo, updateTodo, deleteTodo } from "../../api/todosApi"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons"
import { useState } from 'react'

  const TodoList = () => {

    const [newTodo, setNewTodo] = useState('')
    const queryClient = useQueryClient()

     const { isLoading, isError, error, data: todos } = useQuery('todos', getTodos)

    const addTodoMutation = useMutation(addTodo, { onSuccess: () => {  queryClient.invalidateQueries("todos") } })

    const updateTodoMutation = useMutation(updateTodo, {  onSuccess: () => { queryClient.invalidateQueries("todos") }})

    const deleteTodoMutation = useMutation(deleteTodo, { onSuccess: () => {  queryClient.invalidateQueries("todos") }})





    const handleSubmit = (e) => {
        e.preventDefault()
        addTodoMutation.mutate({ userId: 1, title: newTodo, completed: false })
        setNewTodo('')
    }

    const newItemSection = (
        <form onSubmit={handleSubmit}>
            <label htmlFor="new-todo">Enter a new todo item</label>
            <div className="new-todo">
                <input
                    type="text"
                    id="new-todo"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Enter new todo"
                />
            </div>
            <button className="submit">
                <FontAwesomeIcon icon={faUpload} />
            </button>
        </form>
    )

    let content
    if (isLoading) {
        content = <p>Loading...</p>
    } else if (isError) {
        content = <p>{error.message}</p>
    } else {
        content = todos.map((todo) => {
            return (
                <article key={todo.id}>
                    <div className="todo">
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            id={todo.id}
                            onChange={() =>
                                updateTodoMutation.mutate({ ...todo, completed: !todo.completed })
                            }
                        />
                        <label htmlFor={todo.id}>{todo.title}</label>
                    </div>
                    <button className="trash" onClick={() => deleteTodoMutation.mutate({ id: todo.id })}>
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </article>
            )
        })
    }

    return (
        <main>
            <h1>Todo List</h1>
            {newItemSection}
            {content}
        </main>
    )
}
export default TodoList





import { useQuery, useQueryClient } from '@tanstack/react-query';

export function createGlobalState<T>(
  queryKey: unknown,
  initialData: T | null = null,
) {
  return function () {
    const queryClient = useQueryClient();

    const { data } = useQuery({
      queryKey: [queryKey],
      queryFn: () => Promise.resolve(initialData),
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
    });

    function setData(data: Partial<T>) {
      queryClient.setQueryData([queryKey], data);
    }

    function resetData() {
      queryClient.invalidateQueries({
        queryKey: [queryKey],
      });
      queryClient.refetchQueries({
        queryKey: [queryKey],
      });
    }

    return { data, setData, resetData };
  };
}

import { createGlobalState } from '.';

type UserState = {
  name: string;
  isSignedIn: boolean;
};

export const useUserState = createGlobalState<UserState>('user', {
  name: 'Darius',
  isSignedIn: true,
});


import { useUserState } from './state/user';

export default function App() {
  const { setData, resetData } = useUserState();

  return (
    <div>
      <UserCard />
      <input onChange={(e) => setData({ name: e.target.value })} />
      <button onClick={resetData}>Reset</button>
    </div>
  );
}

function UserCard() {
  const { data } = useUserState();
  return (
    <>
      <h1 className="text-xl font-bold">{data?.name}</h1>
    </>
  );
}

