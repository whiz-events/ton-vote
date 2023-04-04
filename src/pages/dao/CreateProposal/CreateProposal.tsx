import { Box, styled, Typography } from "@mui/material";
import {
  Button,
  ConnectButton,
  Container,
  MapInput,
  SideMenu,
  useNotification,
} from "components";
import { FormikProps, useFormik } from "formik";
import { useDaoAddress } from "hooks";
import { useCreateProposal } from "query/mutations";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { ProposalMetadata } from "ton-vote-npm";
import { FormData, FormSchema, useInputs } from "./form";
import { useCreateProposalStore } from "./store";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useConnection } from "ConnectionProvider";

function CreateProposal() {
  const { mutate: createProposal, isLoading } = useCreateProposal();
  const daoAddress = useDaoAddress();
  const { formData, setFormData, preview } = useCreateProposalStore();
  const { showNotification } = useNotification();

  const onCreate = (values: FormData) => {
    if (values.proposalSnapshotTime! >= values.proposalStartTime!) {
      showNotification({
        variant: "error",
        message:
          "Proposal snapshot time must be less than proposal start time",
      });
      return;
    }
    if (values.proposalStartTime! >= values.proposalEndTime!) {
      showNotification({
        variant: "error",
        message: "Proposal start time must be less than proposal end time",
      });
      return;
    }
    const proposalMetadata: ProposalMetadata = {
      proposalStartTime: BigInt(values.proposalStartTime!),
      proposalEndTime: BigInt(values.proposalEndTime!),
      proposalSnapshotTime: BigInt(values.proposalSnapshotTime!),
      votingPowerStrategy: BigInt(1),
      proposalType: BigInt(1),
    };
    createProposal({ daoAddr: daoAddress, proposalMetadata });
  };

  const formik = useFormik<FormData>({
    initialValues: {
      proposalStartTime: formData.proposalStartTime,
      proposalEndTime: formData.proposalEndTime,
      proposalSnapshotTime: formData.proposalSnapshotTime,
      description: formData.description,
      title: formData.title,
    },
    validationSchema: FormSchema,
    onSubmit: (values) => onCreate(values),
    validateOnChange: false,
    validateOnBlur: true,
  });

  useEffect(() => {
    return () => {
      setFormData(formik.values);
    };
  }, [formik.values]);

  return (
    <StyledFlexRow alignItems="flex-start">
      <StyledContainer title="Create Proposal">
        {preview ? (
          <Preview formik={formik} />
        ) : (
          <CreateForm formik={formik} />
        )}
      </StyledContainer>
      <CreateProposalMenu isLoading={isLoading} onSubmit={formik.submitForm} />
    </StyledFlexRow>
  );
}

export { CreateProposal };

const Preview = ({ formik }: { formik?: FormikProps<FormData> }) => {
  return (
    <StyledPreview>
      <Typography variant="h2" className="title">{formik?.values.title}</Typography>
      <ReactMarkdown>{formik?.values.description || ''}</ReactMarkdown>
    </StyledPreview>
  );
};

const StyledPreview = styled(Box)({
  
  ".title": {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 20,
  },
  img:{
    maxWidth:'100%',
    marginTop: 10
  }
})

function CreateForm({ formik }: { formik: FormikProps<FormData> }) {
  const inputs = useInputs(formik);

  return (
    <StyledFlexColumn gap={30}>
      {inputs.map((input) => {
        return (
          <MapInput<FormData> key={input.name} input={input} formik={formik} />
        );
      })}
    </StyledFlexColumn>
  );
}

function CreateProposalMenu({
  onSubmit,
  isLoading,
}: {
  onSubmit?: () => void;
  isLoading: boolean;
}) {
  const { preview, setPreview } = useCreateProposalStore();
  const address = useConnection().address;
  return (
    <StyledMenu>
      <StyledFlexColumn>
        {preview ? (
          <StyledButton onClick={() => setPreview(false)}>Edit</StyledButton>
        ) : (
          <StyledButton onClick={() => setPreview(true)}>Preview</StyledButton>
        )}
        {!address ? (
          <StyledConnect />
        ) : (
          <StyledButton disabled={preview} isLoading={isLoading} onClick={onSubmit}>
            Continue
          </StyledButton>
        )}
      </StyledFlexColumn>
    </StyledMenu>
  );
}

const StyledMenu = styled(SideMenu)({});

const StyledConnect = styled(ConnectButton)({
  width: "100%",
});

const StyledButton = styled(Button)({
  width: "100%",
});

const StyledContainer = styled(Container)({
  flex: 1,
  ".date-input": {
    ".MuiFormControl-root": {
      maxWidth: 350,
      width: "100%",
    },
  },
});
