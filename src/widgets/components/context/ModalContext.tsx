/**
 * ModalContext.tsx
 *
 * Global modal context for managing modals across the application.
 * Allows registering modals via JSX and provides type-safe utility functions
 * to open/close them with data injection and optional close callbacks.
 * Enforces single modal open at a time.
 */

import Dialog from '@jetbrains/ring-ui-built/components/dialog/dialog'
import type React from 'react'
import {
	type ComponentType,
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react'

/**
 * Standard props interface for modal components.
 * Modal components receive these props and are automatically wrapped in RingUI Dialog by ModalContext.
 */
export interface ModalProps<T = unknown> {
	/** Data injected when modal is opened */
	data?: T
	/** Function to close the modal */
	onClose: () => void
}

/**
 * Internal state for an open modal
 */
interface OpenModalState {
	id: string
	data?: unknown
	onCloseCallback?: () => void
}

/**
 * Modal registry entry
 */
interface ModalRegistryEntry {
	component: ComponentType<ModalProps<any>>
}

/**
 * Functions to control a specific modal
 */
interface ModalControls {
	/** Open the modal with optional data and close callback */
	open: (data?: unknown, onClose?: () => void) => void
	/** Close the modal */
	close: () => void
}

/**
 * Context type for modal management
 */
interface ModalContextType {
	/** Registry of all registered modals */
	modals: Record<string, ModalControls>
	/** Register a modal component */
	registerModal: (id: string, component: ComponentType<ModalProps<unknown>>) => void
	/** Unregister a modal component */
	unregisterModal: (id: string) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

/**
 * ModalProvider - Provides modal management functionality to children
 */
export const ModalProvider = ({ children }: { children: ReactNode }) => {
	const [modalRegistry, setModalRegistry] = useState<Record<string, ModalRegistryEntry>>({})
	const [openModal, setOpenModal] = useState<OpenModalState | null>(null)

	/**
	 * Register a modal component
	 */
	const registerModal = useCallback((id: string, component: ComponentType<ModalProps<any>>) => {
		setModalRegistry((prev) => ({
			...prev,
			[id]: { component }
		}))
	}, [])

	/**
	 * Unregister a modal component
	 */
	const unregisterModal = useCallback(
		(id: string) => {
			setModalRegistry((prev) => {
				const updated = { ...prev }
				delete updated[id]
				return updated
			})
			// Close modal if it's the one being unregistered
			if (openModal?.id === id) {
				setOpenModal(null)
			}
		},
		[openModal]
	)

	/**
	 * Open a modal by ID
	 */
	const openModalById = useCallback(
		(id: string, data?: unknown, onClose?: () => void) => {
			if (!modalRegistry[id]) {
				console.warn(`Modal with id "${id}" is not registered`)
				return
			}

			// Close any currently open modal before opening new one
			if (openModal) {
				// Trigger close callback if exists
				if (openModal.onCloseCallback) {
					openModal.onCloseCallback()
				}
			}

			setOpenModal({ id, data, onCloseCallback: onClose })
		},
		[modalRegistry, openModal]
	)

	/**
	 * Close the currently open modal
	 */
	const closeModal = useCallback(() => {
		if (openModal?.onCloseCallback) {
			openModal.onCloseCallback()
		}
		setOpenModal(null)
	}, [openModal])

	/**
	 * Create modal controls for a specific modal ID
	 */
	const createModalControls = useCallback(
		(id: string): ModalControls => ({
			open: (data?: unknown, onClose?: () => void) => openModalById(id, data, onClose),
			close: () => {
				// Only close if this is the currently open modal
				if (openModal?.id === id) {
					closeModal()
				}
			}
		}),
		[openModalById, closeModal, openModal]
	)

	/**
	 * Build modals object with controls for all registered modals
	 */
	const modals = useMemo(() => {
		const controls: Record<string, ModalControls> = {}
		Object.keys(modalRegistry).forEach((id) => {
			controls[id] = createModalControls(id)
		})
		return controls
	}, [modalRegistry, createModalControls])

	/**
	 * Get the currently open modal component to render
	 */
	const ActiveModal = useMemo(() => {
		if (!openModal) {
			return null
		}

		const entry = modalRegistry[openModal.id]
		if (!entry) {
			return null
		}

		const ModalComponent = entry.component
		return (
			<Dialog show={true} onCloseAttempt={closeModal} contentClassName='modal-content'>
				<ModalComponent data={openModal.data} onClose={closeModal} />
			</Dialog>
		)
	}, [openModal, modalRegistry, closeModal])

	return (
		<ModalContext.Provider
			value={{
				modals,
				registerModal,
				unregisterModal
			}}
		>
			{children}
			{ActiveModal}
		</ModalContext.Provider>
	)
}

/**
 * Hook to access the full modal context
 */
export const useModalContext = (): ModalContextType => {
	const context = useContext(ModalContext)
	if (!context) {
		throw new Error('useModalContext must be used within ModalProvider')
	}
	return context
}

/**
 * Type-safe hook to access a specific modal by ID
 * @param id - The modal ID
 * @returns Object with open and close functions
 */
export const useModal = <T = unknown>(
	id: string
): { open: (data?: T, onClose?: () => void) => void; close: () => void } => {
	const { modals } = useModalContext()

	const modalControls = modals[id]
	if (!modalControls) {
		console.warn(
			`Modal with id "${id}" is not registered. Make sure to register it with <Modal id="${id}" component={YourModal} />`
		)
	}

	return useMemo(
		() => ({
			open: (data?: T, onClose?: () => void) => {
				if (modalControls) {
					modalControls.open(data, onClose)
				}
			},
			close: () => {
				if (modalControls) {
					modalControls.close()
				}
			}
		}),
		[modalControls]
	)
}

/**
 * Modal registration component
 * Use this to register modals in your component tree
 *
 * @example
 * <Modal id="confirmDelete" component={ConfirmDeleteModal} />
 */
interface ModalRegistrationProps {
	/** Unique identifier for the modal */
	id: string
	/** Modal component that accepts ModalProps<T> */
	component: ComponentType<ModalProps<any>>
}

export const Modal: React.FC<ModalRegistrationProps> = ({ id, component }) => {
	const { registerModal, unregisterModal } = useModalContext()

	useEffect(() => {
		registerModal(id, component)
		return () => {
			unregisterModal(id)
		}
	}, [id, component, registerModal, unregisterModal])

	// This component doesn't render anything
	return null
}
