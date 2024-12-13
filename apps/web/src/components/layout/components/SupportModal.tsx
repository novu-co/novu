import { errorMessage, Modal, successMessage } from '@novu/design-system';
import { css } from '@novu/novui/css';
import { Button, Title, Textarea } from '@novu/novui';
import { HStack, Box } from '@novu/novui/jsx';
import { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { createThread } from '../../../api/support';

export type SupportModalProps = {
  isOpen: boolean;
  toggleOpen: () => void;
};

export const SupportModal: FC<SupportModalProps> = ({ isOpen, toggleOpen }) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm({
    defaultValues: {
      threadText: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await createThread({ threadText: data.threadText });
      successMessage('Thanks for contacting us! We will get back to you soon.');
      reset();
      toggleOpen();
    } catch (error) {
      errorMessage('Something went wrong. Please reach out to us at support@novu.co');
    }
  };

  return (
    <>
      <Modal opened={isOpen} title={<Title variant="section">Contact Us</Title>} onClose={toggleOpen}>
        <Box colorPalette={'mode.local'}>
          <Controller
            name="threadText"
            control={control}
            rules={{
              required: true,
              minLength: 10,
            }}
            render={({ field: { onChange, value } }) => (
              <Textarea
                label={'Ask questions, report bugs, request features or share feedback'}
                description={
                  'Our team will get back to you as soon as possible over the email. Please provide as much detail as possible to help us understand your request.'
                }
                required={true}
                maxRows={8}
                minRows={8}
                onChange={onChange}
                value={value}
                className={css({ marginBottom: '20px' })}
              />
            )}
          />

          <HStack justify={'space-between'}>
            <div>
              <HStack gap="50" className={css({ color: 'typography.text.secondary' })}>
                You can also email us at
                <a href="mailto:support@novu.co">support@novu.co</a>
              </HStack>
            </div>
            <Button size={'md'} disabled={!isValid} onClick={handleSubmit(onSubmit)}>
              Submit
            </Button>
          </HStack>
        </Box>
      </Modal>
    </>
  );
};
