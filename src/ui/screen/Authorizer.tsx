import ky from "ky";
import { createSignal, JSXElement, Show } from "solid-js";

import { setToken, token } from "../../service/signal/token";
import { Alert, AlertDescription, AlertTitle } from "../base/Alert";
import { Button } from "../base/Button";
import {
  TextField,
  TextFieldDescription,
  TextFieldLabel,
  TextFieldRoot,
} from "../base/TextField";

export const Authorizer = (props: { children: JSXElement }) => {
  const [error, setError] = createSignal("");
  return (
    <div class="container mx-auto p-5">
      <h1 class="text-3xl font-bold my-10">Deep CCTV</h1>
      <Show fallback={props.children} when={!token()}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            ky.post(`${import.meta.env.VITE_APP_API_URL}/authorize`, {
              json: {
                token: `${form.get("id")},${form.get("secret")}`,
                client_name: "monitor",
              },
            })
              .json<string>()
              .then(
                (token) => setToken(token),
                () => setError("인증에 실패했습니다")
              );
          }}
        >
          {error() && (
            <Alert class="my-10 max-w-xs" variant="destructive">
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9v4m-1.637-9.409L2.257 17.125a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0zM12 16h.01"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
              <AlertTitle>로그인 실패</AlertTitle>
              <AlertDescription>
                아이디와 인증 암호를 확인해주세요
              </AlertDescription>
            </Alert>
          )}
          <TextFieldRoot class="w-full max-w-xs" name="id">
            <TextFieldLabel>클라이언트 아이디 입력</TextFieldLabel>
            <TextField type="text" />
            <TextFieldDescription>
              서비스 관리자에게 아이디를 문의하세요
            </TextFieldDescription>
          </TextFieldRoot>
          <TextFieldRoot class="w-full max-w-xs mt-10" name="secret">
            <TextFieldLabel>인증 암호 입력</TextFieldLabel>
            <TextField type="password" />
            <TextFieldDescription>
              서비스 관리자에게 인증코드를 문의하세요
            </TextFieldDescription>
          </TextFieldRoot>
          <Button class="mt-14" type="submit">
            인증
          </Button>
        </form>
      </Show>
    </div>
  );
};
