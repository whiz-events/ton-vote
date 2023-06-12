import { Box, styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  Button,
  Img,
  Link,
  Markdown,
  TitleContainer,
} from "components";
import { StyledFlexColumn } from "styles";
import { useCreatDaoStore } from "../store";
import { Submit } from "./Submit";
import { MetadataArgs } from "ton-vote-contracts-sdk";
import { DaoRolesForm, InputArgs } from "types";
import _ from "lodash";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useDaoMetadataForm, useDaoRolesForm } from "../form";
import { useCreateDaoQuery } from "query/setters";
import {  useAppNavigation } from "router/navigation";
import { useNewDataStore } from "store";
import { useRegistryStateQuery } from "query/getters";
import { isZeroAddress } from "utils";
import { getBorderColor } from "theme";

const useCreateDao = () => {
  const { rolesForm, metadataAddress, reset } = useCreatDaoStore();
  const { addDao } = useNewDataStore();
  const appNavigation = useAppNavigation();

  const { mutate, isLoading } = useCreateDaoQuery();
  return {
    createDao: () => mutate({
      metadataAddress: metadataAddress!,
      ownerAddress: rolesForm.ownerAddress,
      proposalOwner: rolesForm.proposalOwner,
      onSuccess: (address: string) => {
        appNavigation.daoPage.root(address);
        addDao(address);
        reset();
      },
    }),
    isLoading,
  };
};

export function CreateDaoStep() {
  const { createDao, isLoading } = useCreateDao();
  const translations = useCreateDaoTranslations();
  const commonTranslations = useCommonTranslations();
  const { daoMetadataForm, rolesForm } = useCreatDaoStore();
  const registryState = useRegistryStateQuery().data;

  const metadata = useDaoMetadataForm();
  const roles = useDaoRolesForm();

  return (
    <TitleContainer title={translations.createSpace}>
      <StyledFlexColumn>
        <StyledInputs>
          <>
            {roles.map((section) => {
              return section.inputs.map((input) => {
                const name = input.name as keyof DaoRolesForm;

                return (
                  <InputPreview
                    key={input.name}
                    input={input}
                    value={rolesForm[name]}
                  />
                );
              });
            })}
            {metadata.map((section) => {
              return section.inputs.map((input) => {
                const name = input.name as keyof MetadataArgs;

                return (
                  <InputPreview
                    key={input.name}
                    input={input}
                    value={daoMetadataForm[name]}
                  />
                );
              });
            })}
          </>
        </StyledInputs>
        <Submit>
          <Button
            isLoading={
              isLoading || registryState?.deployAndInitDaoFee === undefined
            }
            onClick={createDao}
          >
            {commonTranslations.create}
          </Button>
        </Submit>
      </StyledFlexColumn>
    </TitleContainer>
  );
}

const StyledInputs = styled(StyledFlexColumn)({
  gap: 20,
});

const InputPreview = ({
  input,
  value,
}: {
  input: InputArgs<any>;
  value: any;
}) => {
  const getValue = () => {
    if (input.name === "dev") return 
      if (input.type === "address" && isZeroAddress(value)) {
        return null;
      }
    if (input.type === "checkbox") {
      return <Typography>{value ? "Yes" : "No"}</Typography>;
    }
    if (!value) return null;
    if (input.type === "url") {
      return <StyledLink href={value}>{value}</StyledLink>;
    }
    if (input.type === "image") {
      return <StyledImage src={value} />;
    }
    if (input.type === "address") {
      return <AddressDisplay padding={10} address={value} />;
    }

    if (input.type === "textarea") {
      return <StyledMd>{value}</StyledMd>;
    }
    return <Typography>{value}</Typography>;
  };

  const component = getValue();
  if (!component) return null;
  return (
    <StyledInputPreview>
      <Markdown className="label">{input.label}</Markdown>
      <StyledInputPreviewComponent>{component}</StyledInputPreviewComponent>
    </StyledInputPreview>
  );
};

const StyledInputPreviewComponent = styled(Box)(({ theme }) => ({
  borderRadius: 10,
  border: `1px solid ${getBorderColor(theme.palette.mode)}`,
  width: "100%",
  padding: 10,
}));

const StyledImage = styled(Img)({
  width: 45,
  height: 45,
  borderRadius: "50%",
  overflow: "hidden",
});

const StyledLink = styled(Link)({
  width: "auto",
});

const StyledMd = styled(Markdown)({
  width: "100%",
});

const StyledInputPreview = styled(StyledFlexColumn)(({ theme }) => ({
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  gap: 5,
  fontSize: 16,
  color: theme.palette.text.primary,
  ".label": {
    fontSize: 14,
    fontWeight: 600,
  },
}));
