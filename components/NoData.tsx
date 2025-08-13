type NoDataProps = { children?: string }

const NoData = ({ children }: NoDataProps) => (
  <div className="py-8 text-center">
    <div className="font-sans text-sm text-body-secondary">
      no data {children}
    </div>
  </div>
)

NoData.displayName = "NoData"

export default NoData
